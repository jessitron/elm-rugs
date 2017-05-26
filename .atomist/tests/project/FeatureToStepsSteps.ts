import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

When("the FeatureToSteps is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("FeatureToSteps");
    w.editWith(editor, { inputParameter: "the inputParameter value" });
});

Then("the hello file says hello", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    return p.fileContains("hello.txt", "Hello, World!");
});


Given("an empty project", (p: Project, world: ProjectScenarioWorld) => { });

Given("an empty project", (p: Project, world: ProjectScenarioWorld) => { });

Given("an empty project", (p: Project, world: ProjectScenarioWorld) => { });

Given("an empty project", (p: Project, world: ProjectScenarioWorld) => {});
