
import { MatchingLogic, MatchPrefixResult, Term, TerminalPatternMatch } from "../PatternMatch";
import { emptyMatch } from "../Utils";
import { InputState } from "../InputState";
/**
 * The rest of a Java block, going to a matching depth of +1 curlies.
 * Does not consume final curly
 */
export const BlockBody: MatchingLogic = {

    $id: "Java.BlockBody",

    matchPrefix: function(is: InputState): MatchPrefixResult {
        let curlyDepth = 1;
        if (is.exhausted())
            return emptyMatch(is);

        let currentIs = is;
        let matched = "";
        while (!currentIs.exhausted() && curlyDepth > 0) {
            matched += currentIs.peek();
            currentIs = currentIs.advance();
        }
        return new TerminalPatternMatch(this.$id, matched, is.offset, currentIs);
    },
};

export const JavaBlock: Term = {
    $id: "JavaBlock",
    _lp: "{",
    block: BlockBody,
    _rp: "}"

} as Term;


/**
 * State machine for recognizing Java strings.
 */
class StringStateMachine {

    private state: "normal" | "seenEscape" = "normal";

    public consume(s: string): boolean {
        return false;
    }
}