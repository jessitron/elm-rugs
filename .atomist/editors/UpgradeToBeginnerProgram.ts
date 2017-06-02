import { Project } from "@atomist/rug/model/Project";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { TextTreeNode } from "@atomist/rug/tree/PathExpression";
import { drawTree } from "./TreePrinter";

/**
 * Sample TypeScript editor used by AddUpgradeToBeginnerProgram.
 */
@Editor("UpgradeToBeginnerProgram", "Turn a static page into an interactive page")
@Tags("elm")
export class UpgradeToBeginnerProgram implements EditProject {

    public edit(project: Project) {
        const pxe = project.context.pathExpressionEngine;

        const basicMainTreeNode = pxe.scalar<Project, TextTreeNode>(project, "/src/Main.elm/Elm()");
        const typeOfMain = pxe.scalar<TextTreeNode, TextTreeNode>(basicMainTreeNode,
            "//typeDeclaration[@functionName='main']/declaredType/typeReference/typeName");
        console.log("Type of main is: \n" + drawTree(typeOfMain));
        if (typeOfMain.value() === "Program") {
            // nothing to do here, it's already a Program
            return;
        }

        // bring the code we need in to the project so we can parse it
        project.copyEditorBackingFileOrFailToDestination("src/BeginnerProgram.elm", "deleteme/BeginnerProgram.elm");
        const beginnerProgramTreeNode = pxe.scalar(project, "/deleteme/BeginnerProgram.elm/Elm()");

        // TODO: imports.
        const existingImports = pxe.evaluate<TextTreeNode, TextTreeNode>(basicMainTreeNode, "//import").matches;
        if (existingImports.length < 1) {
            throw new Error("Did not detect import section in Main.elm");
        }
        const lastImport = existingImports[existingImports.length - 1];

        let state = "before-imports";
        let stuffToAdd = "";
        pxe.with<TextTreeNode>(beginnerProgramTreeNode, "/*",
            (topLevel) => {
                console.log(`> Looking at: ${topLevel.nodeName()}`)
                if (state === "before-imports") {
                    if (topLevel.nodeName() === "import") {
                        console.log("> detected an import");
                        state = "in-imports";
                    }
                } else if (state === "in-imports") {
                    if (topLevel.nodeName() !== "import") {
                        console.log("> past impoert ");
                        state = "inserting-things";
                    }
                } else if (state === "inserting-things") {
                    console.log(`> inserting: ${topLevel.value()}`);
                    stuffToAdd = stuffToAdd + "\n\n" + topLevel.value();
                }
            }
        );

        lastImport.update(lastImport.value() + stuffToAdd);

        console.log("Here is the file yo");
        console.log(basicMainTreeNode.value().replace(/^$/mg, "[blank]"));

        throw new Error("not done yet");

    }
}

export const upgradeToBeginnerProgram = new UpgradeToBeginnerProgram();
