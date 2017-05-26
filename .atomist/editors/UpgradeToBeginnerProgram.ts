import { Project } from "@atomist/rug/model/Project";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * Sample TypeScript editor used by AddUpgradeToBeginnerProgram.
 */
@Editor("UpgradeToBeginnerProgram", "Turn a static page into an interactive page")
@Tags("documentation")
export class UpgradeToBeginnerProgram implements EditProject {

    @Parameter({
        displayName: "Some Input",
        description: "example of how to specify a parameter using decorators",
        pattern: Pattern.any,
        validInput: "a description of the valid input",
        minLength: 1,
        maxLength: 100,
    })
    public inputParameter: string;

    public edit(project: Project) {
        project.addFile("hello.txt", "Hello, World!\n" + this.inputParameter + "\n");
    }
}

export const upgradeToBeginnerProgram = new UpgradeToBeginnerProgram();
