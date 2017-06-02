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

        function descend(from: TextTreeNode, path: string): TextTreeNode {
            try {
                return pxe.scalar<TextTreeNode, TextTreeNode>(from, path);
            } catch (e) {
                console.log("the children are: " + from.children().map((n) => n.nodeName() + (n as any).sectionHeader.value()).join(","));
                throw e;
            }
        }

        // the stuff we need from the existing program
        const existingModuleBody = descend(basicMainTreeNode, "/moduleBody");
        const existingMain = descend(existingModuleBody, "//functionDeclaration[@functionName='main']");
        const everythingButMain: string = existingModuleBody.value().replace(existingMain.value(), "");
        // TODO: could remove some whitespace too

        // bring the code we need in to the project so we can parse it
        project.copyEditorBackingFileOrFailToDestination("src/BeginnerProgram.elm", "deleteme/BeginnerProgram.elm");
        const beginnerProgramTreeNode =
            pxe.scalar<Project, TextTreeNode>(project, "/deleteme/BeginnerProgram.elm/Elm()");

        // TODO: imports.

        const beginnerProgramModuleBody =
            descend(beginnerProgramTreeNode, "/moduleBody");
        const viewSection =
            beginnerProgramModuleBody.children().
                map(t => t as TextTreeNode).
                filter(ttn => ttn.nodeName() === "section").
                map(a => a as any).
                filter(a => {
                    console.log(`found a section with value <${a.sectionHeader.value()}>`);
                    return a.sectionHeader.value() === "VIEW";
                })[0];
        console.log("found view section: " + viewSection)
        descend(beginnerProgramModuleBody, "/section[/sectionHeader[@value='VIEW']]");
        const viewFunctionBody = descend(viewSection, "/functionDeclaration[@functionName='view']/body");
        viewFunctionBody.update((existingMain as any).body);
        viewSection.update(viewSection.value() + everythingButMain);

        existingModuleBody.update(beginnerProgramModuleBody.value());

        console.log("Here is the file yo");
        console.log(basicMainTreeNode.value().replace(/^$/mg, "[blank]"));

        throw new Error("not done yet");

    }
}

export const upgradeToBeginnerProgram = new UpgradeToBeginnerProgram();
