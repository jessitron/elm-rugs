import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

When("the UpgradeToBeginnerProgram is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("UpgradeToBeginnerProgram");
    w.editWith(editor, { inputParameter: "the inputParameter value" });
});

When("adding a function that returns Html Never", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("AddFunction");
    w.editWith(editor, { name: "friendly", type: "Html Never", body: "Html.div [] []" });
});

Then("the type of main is (.*)", (p: Project, world: ProjectScenarioWorld, desiredType: string) => {
    const mainElm = p.findFile("src/Main.elm").content;

    const m = mainElm.match(/^main : (.*)$/m);
    const mainFunctionType = m[1];
    return (mainFunctionType === desiredType);
});

Then("the type of that function is Html Msg", (p: Project, world: ProjectScenarioWorld, desiredType: string) => {
    const mainElm = p.findFile("src/Main.elm").content;

    const m = mainElm.match(/^friendly : (.*)$/m);
    const friendlyFunctionType = m[1];
    return (friendlyFunctionType === "Html Msg");
});
