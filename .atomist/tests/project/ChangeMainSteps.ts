import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

const CERTAIN_INPUT_FILEPATH = "src/Main.elm";

const CERTAIN_FILE_CONTENT_BEFORE = `module Main exposing (main)

import Html exposing (Html)


main : Html Never
main =
    Html.div [] []

otherFn = "blah"
`;

const CERTAIN_FILE_CONTENT_AFTER = `module Main exposing (main)

import Html exposing (Html)


main : Html Never
main =
    Html.text "Hello World"

otherFn = "blah"
`;

Given("a project with a certain file", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, CERTAIN_FILE_CONTENT_BEFORE);
});

When("the ChangeMain is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("ChangeMain");
    w.editWith(editor, { newBody: "Html.text \"Hello World\"" });
});

Then("that certain file looks different", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
    const passing = (after === CERTAIN_FILE_CONTENT_AFTER);
    if (!passing) {
        console.log(
            `FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${
            after.replace(/^$/mg, "[blank line]")
            }\n<---`);
    }
    return passing;
});
