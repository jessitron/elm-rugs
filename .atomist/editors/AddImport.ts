import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * Sample TypeScript editor used by AddAddImport.
 */
@Editor("AddImport", "add an import")
@Tags("documentation")
export class AddImport implements EditProject {

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
        const certainFile = project.findFile("hello.txt");
        const newContent = certainFile.content.replace(/the world/, this.inputParameter);
        certainFile.setContent(newContent);
    }
}

export const addImport = new AddImport();
