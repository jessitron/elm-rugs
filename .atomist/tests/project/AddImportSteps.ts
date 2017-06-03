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
`;

const CERTAIN_FILE_CONTENT_AFTER = `module Main exposing (main)

import Html exposing (Html)
import Html.Attributes


main : Html Never
main =
    Html.div [] []
`;

Given("a project with an Elm program", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, CERTAIN_FILE_CONTENT_BEFORE);
});

When("the AddImport is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("AddImport");
    w.editWith(editor, { import: "Html.Attributes" });
});

Then("the file has the import", (p: Project, world) => {
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
