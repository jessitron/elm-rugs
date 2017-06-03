import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

const CERTAIN_INPUT_FILEPATH = "src/Main.elm";

const CERTAIN_FILE_CONTENT_AFTER = `module Main exposing (main)

import Html exposing (Html)


main : Html Never
main =
    Html.div [] []

diagram : String
diagram = "elmbp.png"
`;

When("the AddFunction is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("AddFunction");
    w.editWith(editor, { name: "diagram", type: "String", body: "\"elmbp.png\"" });
});

Then("the Elm program has the new function", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
    const passing = (after === CERTAIN_FILE_CONTENT_AFTER);
    if (!passing) {
        console.log(JSON.stringify(CERTAIN_FILE_CONTENT_AFTER));
        console.log(JSON.stringify(after));
        console.log(
            `FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${
            after.replace(/^$/mg, "[blank line]")
            }\n<---`);
    }
    return passing;
});
