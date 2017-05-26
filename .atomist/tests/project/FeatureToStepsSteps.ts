import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

const existingSteps = [
    {
        use: "Then things are great",
        definition: `Then("things are great",...)`,
    },
    {
        use: "When you cheer me up",
        definition: `When("you cheer ([a-z]+) up",...)`,
    },
];

const newSteps = [
    {
        use: "Given I am sad",
        definition: `Given("I am sad"`,
    },
    {
        use: "When I am out of cookies",
        definition: `When("I am out of cookies"`,
    },
];

const featureFile = ".atomist/tests/project/SomethingTest.feature";
const stepFile = ".atomist/tests/project/SomethingSteps.ts";

Given("a project with a feature file", (p: Project, world: ProjectScenarioWorld) => {
    p.addFile(featureFile, "Scenario bladebah:\n\n" +
        existingSteps.concat(newSteps).map((s) => s.use).join("\n"));
});

Given("some of the steps are defined", (p: Project, world: ProjectScenarioWorld) => {
    p.addFile(stepFile, "import stuff;\n\n" + existingSteps.map((s) => s.definition).join("\n"));
});

When("the FeatureToSteps editor is run", (p: Project, world: ProjectScenarioWorld) => {
    const editor = world.editor("FeatureToSteps");
    world.editWith(editor, { featureFile });
});

Then("all the steps are defined", (p: Project, world: ProjectScenarioWorld) => {
    const content = p.findFile(stepFile).content;
    const result = newSteps.every((s) => content.indexOf(s.definition) > 0);
    if (!result) {
        console.log("Feature file-------\n" + p.findFile(featureFile).content);
        console.log("Spec file---------\n" + content);
    }
    return result;
});
