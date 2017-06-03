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
        const fullTypeOfMain: string = (existingMain as any).typeDeclaration.declaredType.value();
        const everythingButMain: string = existingModuleBody.value().replace(existingMain.value(), "");
        // TODO: could remove some whitespace too

        // bring the code we need in to the project so we can parse it
        project.copyEditorBackingFileOrFailToDestination("src/BeginnerProgram.elm", "deleteme/BeginnerProgram.elm");

        // TODO: imports.

        const mainBodyText = (existingMain as any).body.value();
        // update the view function to contain the body of Main.main

        pxe.with<TextTreeNode>(project,
            "/deleteme/BeginnerProgram.elm/Elm()//functionDeclaration[@functionName='view']/body",
            (body) => body.update(mainBodyText));

        // add the rest of Main.elm to the view section
        pxe.with<TextTreeNode>(project,
            "/deleteme/BeginnerProgram.elm/Elm()/moduleBody/section[@sectionHeader='VIEW']",
            (section) => section.update(section.value() + everythingButMain),
        );

        pxe.with<TextTreeNode>(project,
            "/deleteme/BeginnerProgram.elm/Elm()/moduleBody",
            (beginnerProgramBody) => {
                // anything that used to return Html Never or whatever the original
                // main was returning, now that should return Html Msg.
                const adjustedBeginnerProgramBody =
                    beginnerProgramBody.value().
                        replace(new RegExp(fullTypeOfMain, "g"), "Html Msg");
                existingModuleBody.update(adjustedBeginnerProgramBody);
            }
        );

        // console.log("Here is the file yo");
        // console.log(basicMainTreeNode.value().replace(/^$/mg, "[blank]"));

        project.deleteFile("deleteme/BeginnerProgram.elm");

    }
}

export const upgradeToBeginnerProgram = new UpgradeToBeginnerProgram();
