import { PopulateProject } from '@atomist/rug/operations/ProjectGenerator'
import { Project } from '@atomist/rug/model/Core'
import { Pattern } from '@atomist/rug/operations/RugOperation'
import { TreeNode } from '@atomist/rug/tree/PathExpression'
import { Generator, Parameter, Tags } from '@atomist/rug/operations/Decorators'

@Generator("StaticPage", "create a new Elm project, simplest possible")
@Tags("elm")
class StaticPage implements PopulateProject {

    @Parameter({
        displayName: "Project Name",
        description: "name of project to be created",
        pattern: Pattern.project_name,
        validInput: "a valid GitHub project name consisting of alphanumeric, ., -, and _ characters",
        minLength: 1,
        maxLength: 100
    })
    project_name: string;

    @Parameter({
        displayName: "Organization",
        validInput: "github owner",
        pattern: Pattern.group_id
    })
    org: string;

    @Parameter({
        pattern: Pattern.any,
        validInput: "String of up to 80 characters",
        maxLength: 80
    })
    description: string = "helpful summary of your project, less than 80 characters";

    populate(project: Project) {

        let repo = "https://github.com/" + this.org + "/" + this.project_name.toLowerCase() + ".git"
        let linkToGithubPages = "https://" + this.org + ".github.io/" + this.project_name


        let index = project.findFile("resources/index.html")
        index.regexpReplace("<title>.*</title>", "<title>" + this.project_name + "</title>")

        let eng = project.context().pathExpressionEngine();


        let elmPackage = project.findFile("elm-package.json")
        eng.with<any>(elmPackage, `/Json()/repository`, e => {
            e.setValue(repo)
        })
        eng.with<any>(elmPackage, `/Json()/summary`, e => {
            console.log("Read some json");
            e.setValue(this.description)
        })

        let newReadmeContent = `# ${this.project_name}
${this.description}

[See it live](${linkToGithubPages})`;

        let readme = project.findFile("README.md");
        readme.setContent(newReadmeContent);

        project.deleteFile(".atomist.yml");
    }

}

export const staticPage = new StaticPage();
