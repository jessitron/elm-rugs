import { Project } from "@atomist/rug/model/Project";
import { Given, ProjectScenarioWorld, Then, When } from "@atomist/rug/test/project/Core";
import { Result } from "@atomist/rug/test/Result";

const filesInStaticPageProject = [
    "src/Main.elm",
    "resources/index.html",
    "resources/styles.css",
    "elm-package.json",
    "build",
    "release",
    ".gitignore",
    ".gitattributes",
    "README.md",
];

// tslint:disable-next-line:no-empty
Given("an empty project", (p) => { });

When("running the StaticPage generator", (p: Project, world: ProjectScenarioWorld) => {
    const generator = world.generator("StaticPage");
    world.generateWith(generator, "banana", { org: "jessitron" });
});

Then("minimal files are included", (p: Project) => {
    const filenames = p.files.map((f) => f.path);
    const result = (
        filesInStaticPageProject.every((f) => p.fileExists(f)) &&
        filenames.length === filesInStaticPageProject.length);
    if (!result) {
        console.log("Expected files: " + filesInStaticPageProject.sort().join(", "));
        console.log("Found files:    " + filenames.sort().join(", "));
    }
    return result;
});
