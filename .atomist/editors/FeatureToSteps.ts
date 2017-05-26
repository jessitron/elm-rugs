import { Project } from "@atomist/rug/model/Project";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";

import { Microgrammar } from "../microgrammar/Microgrammar";
import { AnonymousDefinition, PatternMatch, Term } from "../microgrammar/PatternMatch";
import { Break, Span } from "../microgrammar/snobol/Snobol";

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
        // TODO: create if not exists
        const stepFile = project.findFile(stepFilepath);
        const stepFileContent = stepFile.content;

        // the givens
        const mg = Microgrammar.fromDefinitions("gherkin", {
            given_keyword: "Given",
            given_step: new Break("\n"),
            ...AnonymousDefinition,
        });

        const givenMatches: any[] = mg.findMatches(featureFileContent);
        const givenSteps = givenMatches.map((g) => g.given_step);

        const existingSteps = this.existingGivenSteps(stepFileContent);
        console.log("found steps: " + existingSteps.join("\n"));
        const newSteps = givenSteps.
            filter((s) => existingSteps.indexOf(s) < 0).
            map((step) => `
Given("${step}", (${variety.stepArguments}) => {});
`);

        const newStepContent = stepFileContent + newSteps.join("\n");

        stepFile.setContent(newStepContent);

    }

    private existingGivenSteps(content: string): string[] {
        const mg = Microgrammar.fromDefinitions("steppers", {
            given_keyword: "Given(\"",
            given_step: new Break("\""),
            ...AnonymousDefinition,
        });
        return mg.findMatches(content).map((g: any) => g.given_step);
    }
}

export const featureToSteps = new FeatureToSteps();
