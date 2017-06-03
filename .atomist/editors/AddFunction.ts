import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * Sample TypeScript editor used by AddAddFunction.
 */
@Editor("AddFunction", "add a function to an Elm program")
@Tags("documentation")
export class AddFunction implements EditProject {

    @Parameter({
        displayName: "Function name",
        description: "name of the new function",
        pattern: Pattern.any,
        validInput: "an Elm identifier",
        minLength: 1,
        maxLength: 100,
    })
    public name: string;

    @Parameter({
        displayName: "Function type",
        description: "type of the new function",
        pattern: Pattern.any,
        validInput: "an Elm type",
        minLength: 1,
        maxLength: 100,
    })
    public type: string;

    @Parameter({
        displayName: "Function body",
        description: "body of the new function",
        pattern: Pattern.any,
        validInput: "an Elm expression",
        minLength: 1,
    })
    public body: string;

    @Parameter({
        displayName: "Function parameters",
        description: "parameter list of the new function",
        pattern: Pattern.any,
        validInput: "Elm identifiers or matchers, separated by spaces",
        required: false,
    })
    public parameters: string = "";

    // TODO: parameterize this
    public targetFile = "src/Main.elm";

    // TODO: support a section to add it to

    public edit(project: Project) {
        const certainFile = project.findFile(this.targetFile);
        if (certainFile === null) {
            throw "Can't find file ${this.targetFile}";
        }

        const parameterString = this.parameters === "" ? "" : (this.parameters + " ");

        const newFunction = `
${this.name} : ${this.type}
${this.name} ${parameterString}= ${this.body}
`;

        const newContent = certainFile.content + newFunction;
        certainFile.setContent(newContent);
    }
}

export const addFunction = new AddFunction();
