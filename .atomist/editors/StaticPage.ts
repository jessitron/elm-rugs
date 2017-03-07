import { PopulateProject } from '@atomist/rug/operations/ProjectGenerator'
import { Project } from '@atomist/rug/model/Core'
import { Pattern } from '@atomist/rug/operations/RugOperation'
import { Generator, Parameter, Tags } from '@atomist/rug/operations/Decorators'

@Generator("StaticPage", "sample TypeScript generator used by AddStaticPage")
@Tags("documentation")
class StaticPage implements PopulateProject {

    // this is only necessary to avoid https://github.com/atomist/rug-resolver/issues/17
    @Parameter({
        displayName: "Project Name",
        description: "name of project to be created",
        pattern: Pattern.project_name,
        validInput: "a valid GitHub project name consisting of alphanumeric, ., -, and _ characters",
        minLength: 1,
        maxLength: 100
    })
    project_name: string;

    populate(project: Project) {
        project.deleteFile(".atomist.yml");
    }
}

export const staticPage = new StaticPage();
