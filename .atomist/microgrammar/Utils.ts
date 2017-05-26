import { InputState } from "./InputState";
import { PatternMatch, TerminalPatternMatch } from "./PatternMatch";

export function emptyMatch(is: InputState): PatternMatch {
    return new TerminalPatternMatch("empty", "", is.offset, is);
}
