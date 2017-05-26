import { Project } from "@atomist/rug/model/Project";
import { Generator, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { PopulateProject } from "@atomist/rug/operations/ProjectGenerator";
import { Pattern } from "@atomist/rug/operations/RugOperation";

@Generator("StaticPage", "create a new Elm project, simplest possible")
@Tags("elm")
class StaticPage implements PopulateProject {

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

        const projectName = project.name;

        // remove files used by editors
        project.deleteFile("src/BeginnerProgram.elm");

        const repo = "https://github.com/" + this.org + "/" + projectName.toLowerCase() + ".git";
        const linkToGithubPages = "https://" + this.org + ".github.io/" + projectName;

        const index = project.findFile("resources/index.html");
        index.regexpReplace("<title>.*</title>", "<title>" + projectName + "</title>");

        const eng = project.context.pathExpressionEngine;

        const elmPackage = project.findFile("elm-package.json");
        eng.with<any>(elmPackage, `/Json()/repository`, (e) => {
            e.setValue(repo);
        });
        eng.with<any>(elmPackage, `/Json()/summary`, (e) => {
            console.log("Read some json");
            e.setValue(this.description);
        });

        const newReadmeContent = `# ${projectName}
${this.description}

[See it live](${linkToGithubPages})`;

        const readme = project.findFile("README.md");
        readme.setContent(newReadmeContent);

        project.deleteFile(".atomist.yml");
    }

}

export const staticPage = new StaticPage();
