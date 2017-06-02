import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { TextTreeNode } from "@atomist/rug/tree/PathExpression";

/**
 * Sample TypeScript editor used by AddAddImport.
 */
@Editor("AddImport", "add an import")
@Tags("documentation")
export class AddImport implements EditProject {

    @Parameter({
        displayName: "Module to import",
        description: "the module to import, like Html.Attributes",
        pattern: Pattern.any,
        validInput: "an Elm module name",
        minLength: 1,
        maxLength: 100,
    })
    public import: string;

    public targetFile = "src/Main.elm";

    public edit(project: Project) {
        const certainFile = project.findFile(this.targetFile);
        const newImport = `import ${this.import}`;

        if (certainFile == null) {
            throw `File ${this.targetFile} not found`;
        }

        const imports = project.context.pathExpressionEngine.
            evaluate<File, any>(certainFile,
            "/Elm()/import");
        const before = imports.matches.filter((i) => this.importCompare(i.importName.value(), this.import) < 0);
        const same = imports.matches.filter((i) => i.importName.value() === this.import);
        const after = imports.matches.filter((i) => 0 < this.importCompare(i.importName.value(), this.import));

        if (same.length > 0) {
            // import already present
            return;
        }

        if (before.length > 0) {
            // add it after the last earlier one.
            // so if they're alphabetical, they'll stay alphabetical.
            const last = before[before.length - 1];
            last.update(last.value() + "\n" + newImport);
        } else if (after.length > 0) {
            const first = after[0];
            first.update(newImport + "\n" + first.value());
        }


        // TODO: what if there are 0 imports

        this.trailingNewline(certainFile);
    }

    private importCompare(a: string, b: string): number {
        console.log(`comparing ${a} to ${b}`)
        if (b.indexOf(a) === 0) {
            // a is contained within b. put b later
            return -1;
        }
        if (a.indexOf(b) === 0) {
            return 1;
        }
        if (a < b) { return -1; }
        if (b < a) { return 1; }
        return 0;
    }

    private trailingNewline(f: File) {
        const content = f.content;
        if (!f.content.match(/\n$/)) { f.setContent(content + "\n"); }
    }
}

export const addImport = new AddImport();
