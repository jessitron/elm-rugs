import { Project } from "@atomist/rug/model/Core";
import { Generator, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { PopulateProject } from "@atomist/rug/operations/ProjectGenerator";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { TreeNode } from "@atomist/rug/tree/PathExpression";

@Generator("StaticPage", "create a new Elm project, simplest possible")
@Tags("elm")
class StaticPage implements PopulateProject {

    @Parameter({
        displayName: "Project Name",
        description: "name of project to be created",
        pattern: Pattern.project_name,
        validInput: "a valid GitHub project name consisting of alphanumeric, ., -, and _ characters",
        minLength: 1,
        maxLength: 100,
    })
    public projectName: string;

    @Parameter({
        displayName: "Organization",
        validInput: "github owner",
        pattern: Pattern.group_id,
    })
    public org: string;

    @Parameter({
        pattern: Pattern.any,
        validInput: "String of up to 80 characters",
        maxLength: 80,
    })
    public description: string = "helpful summary of your project, less than 80 characters";

    public populate(project: Project) {

        const repo = "https://github.com/" + this.org + "/" + this.projectName.toLowerCase() + ".git";
        const linkToGithubPages = "https://" + this.org + ".github.io/" + this.projectName;

        const index = project.findFile("resources/index.html");
        index.regexpReplace("<title>.*</title>", "<title>" + this.projectName + "</title>");

        const eng = project.context().pathExpressionEngine();

        const elmPackage = project.findFile("elm-package.json");
        eng.with<any>(elmPackage, `/Json()/repository`, (e) => {
            e.setValue(repo);
        });
        eng.with<any>(elmPackage, `/Json()/summary`, (e) => {
            console.log("Read some json");
            e.setValue(this.description);
        });

        const newReadmeContent = `# ${this.projectName}
${this.description}

[See it live](${linkToGithubPages})`;

        const readme = project.findFile("README.md");
        readme.setContent(newReadmeContent);

        project.deleteFile(".atomist.yml");
    }

}

export const staticPage = new StaticPage();
