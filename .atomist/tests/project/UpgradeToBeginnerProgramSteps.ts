import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

When("the UpgradeToBeginnerProgram is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("UpgradeToBeginnerProgram");
    w.editWith(editor, { inputParameter: "the inputParameter value" });
});

Then("the type of main is (.*)", (p: Project, world: ProjectScenarioWorld, desiredType: string) => {
    const mainElm = p.findFile("src/Main.elm").content;

    const m = mainElm.match(/^main : (.*)$/m);
    const mainFunctionType = m[1];
    return (mainFunctionType === desiredType);
});
