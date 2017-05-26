import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { PathExpressionEngine } from "@atomist/rug/tree/PathExpression";

import { Microgrammar } from "../microgrammar/Microgrammar";
import { AnonymousDefinition, PatternMatch, Term } from "../microgrammar/PatternMatch";
import { Break, Span } from "../microgrammar/snobol/Snobol";

interface Variety { stepArguments: string; }
const projectTest = {
    variety: "project",
    stepArguments: "p: Project, world: ProjectScenarioWorld",
};

const commandHandlerTest = {
    variety: "command",
    stepArguments: "world: CommandHandlerScenarioWorld",
};

const eventHandlerTest = {
    variety: "event",
    stepArguments: "world: EventHandlerScenarioWorld",
};

/**
 * Sample TypeScript editor used by AddFeatureToSteps.
 */
@Editor("FeatureToSteps", "generate the steps for our features")
@Tags("documentation")
export class FeatureToSteps implements EditProject {

    @Parameter({
        displayName: "the feature file",
        description: "path to the feature file",
        pattern: Pattern.any,
        validInput: "tests/JustTheName or tests/JustTheName.feature",
        minLength: 1,
        maxLength: 100,
    })
    public featureFile: string;

    public edit(project: Project) {

        const featureFilepath = (this.featureFile.indexOf(".feature") > 0) ?
            this.featureFile : (this.featureFile + ".feature");

        const variety = (featureFilepath.indexOf("/project/") > 0) ? projectTest :
            ((featureFilepath.indexOf("/command/") > 0) ? commandHandlerTest :
                eventHandlerTest);

        if (!project.fileExists(featureFilepath)) {
            throw new Error(`File ${featureFilepath} not found`);
        }

        const featureFileContent = project.findFile(featureFilepath).content;

        const stepFilepath = featureFilepath.replace(/(Test)?.feature$/, "Steps.ts");
        if (!project.fileExists(stepFilepath)) {
            project.addFile(stepFilepath,
                `import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";
`);
        }
        const stepFile = project.findFile(stepFilepath);
        const stepFileContent = stepFile.content;

        const newStepContent =
            stepFileContent +
            this.doStuff(project, "Given", variety, featureFileContent) +
            this.doStuff(project, "When", variety, featureFileContent) +
            this.doStuff(project, "Then", variety, featureFileContent);

        stepFile.setContent(newStepContent);
    }

    private existingSteps(phase: "Given" | "When" | "Then", project: Project): StepInfo[] {

        const pxe = project.context.pathExpressionEngine;
        let recognizedSteps: StepInfo[] = [];
        pxe.with<File>(project, "/*[@name='.atomist']/tests//File()",
            (file) => {
                if (file.name.match(/\.ts$/)) {
                    recognizedSteps = recognizedSteps.concat(
                        this.recognizeSteps(phase, file));
                }
            });

        pxe.with<File>(project, "//WellKnownSteps.ts",
            (file) => {
                recognizedSteps = recognizedSteps.concat(this.recognizeSteps(phase, file));
            });
        return recognizedSteps;
    }

    private doStuff(
        project: Project,
        phase: "Given" | "When" | "Then",
        variety: Variety,
        featureFileContent: string): string {
        const mg = Microgrammar.fromDefinitions("gherkin", {
            step_keyword: phase,
            step_text: new Break("\n"),
            ...AnonymousDefinition,
        });

        const matches: any[] = mg.findMatches(featureFileContent);
        const steppers = matches.map((g) => g.step_text);

        const existingSteps = this.existingSteps(phase, project);
        const newSteps = steppers.
            filter((s) => {
                const found = whereIsItFound(existingSteps, s);
                if (found) {
                    if (found.step === s) {
                        console.log(`Step '${phase} ${s}' is defined in ${found.filename}`);
                    } else {
                        console.log(`Step '${phase} ${s}' is defined in ${found.filename} as '${found.step}'`);
                    }
                    return false;
                } else {
                    return true;
                }
            },
        );
        return newSteps.
            map((step) => `
${phase}("${step}", (${variety.stepArguments}) => {});
`)
            .join("");
    }

    private recognizeSteps(phase: "Given" | "When" | "Then", file: File): StepInfo[] {
        const mg = Microgrammar.fromDefinitions("steppers", {
            given_keyword: phase + "(\"",
            given_step: new Break("\""),
            ...AnonymousDefinition,
        });
        const matches = mg.findMatches(file.content);
        return matches.
            map((g: any) => g.given_step).
            map((s) => {
                return { step: s, filename: file.path };
            });
    }
}

interface StepInfo {
    filename: string; step: string;
}
// exported for testing
export function whereIsItFound(existingSteps: StepInfo[], thisStep: string): StepInfo | null {
    const match = existingSteps.filter((s) => (new RegExp("^" + s.step + "$")).test(thisStep));
    if (match.length === 0) {
        return null;
    } else {
        return match[0];
    }
}

export const featureToSteps = new FeatureToSteps();
