import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { TextTreeNode } from "@atomist/rug/tree/PathExpression";

/**
 * Sample TypeScript editor used by AddChangeMain.
 */
@Editor("ChangeMain", "Change the body of the main function")
@Tags("elm")
export class ChangeMain implements EditProject {

    @Parameter({
        displayName: "new body of main",
        description: "Elm code to put in the main function",
        pattern: Pattern.any,
        validInput: "an Elm expression returning Html.Html",
        minLength: 1,
    })
    public newBody: string;

    public edit(project: Project) {
        project.context.pathExpressionEngine.with<TextTreeNode>(project,
            `/src/Main.elm/Elm()//functionDeclaration
                     [@functionName='main']
                     /body`
            ,
            (mainBody) => {
                mainBody.update(this.newBody);
            });
        this.trailingNewline(project.findFile("src/Main.elm"));
    }

    private trailingNewline(f: File) {
        const content = f.content;
        if (!f.content.match(/\n$/)) { f.setContent(content + "\n"); }
    }
}

export const changeMain = new ChangeMain();
