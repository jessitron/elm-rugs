import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

const CERTAIN_INPUT_FILEPATH = "hello.txt";

const CERTAIN_FILE_CONTENT_BEFORE = `I love to say hello

to the world
`;

const CERTAIN_FILE_CONTENT_AFTER = `I love to say hello

to you
`;

Given("a project with a certain file", (p: Project, world) => {
    p.addFile(CERTAIN_INPUT_FILEPATH, CERTAIN_FILE_CONTENT_BEFORE);
});

When("the ChangeMain is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("ChangeMain");
    w.editWith(editor, { inputParameter: "you" });
});

Then("that certain file looks different", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const after = p.findFile(CERTAIN_INPUT_FILEPATH).content;
    const passing = (after === CERTAIN_FILE_CONTENT_AFTER);
    if (!passing) {
        console.log(`FAILURE: ${CERTAIN_INPUT_FILEPATH} --->\n${after}\n<---`);
    }
    return passing;
});
