/**
 * SNOBOL-inspired primitives
 */

import { DismatchReport, MatchingLogic, MatchPrefixResult, TerminalPatternMatch } from "../PatternMatch";
import { InputState } from "../InputState";
import { emptyMatch } from "../Utils";

/**
 * Inspired by Snobol SPAN: http://www.snobol4.org/docs/burks/tutorial/ch4.htm
 * SPAN(S) matches one or more subject characters from the set in S.
 * SPAN must match at least one subject character, and will match the LONGEST subject string possible.
 */
export class Span implements MatchingLogic {

    constructor(public characters: string) {
    }

    public $id = `Span[${this.characters}]`;

    matchPrefix(is: InputState): MatchPrefixResult {
        let currentIs = is;
        let matched = "";
        while (!currentIs.exhausted() && this.characters.indexOf(currentIs.peek()) > -1) {
            matched += currentIs.peek();
            currentIs = currentIs.advance();
        }
        return (currentIs != is) ?
             new TerminalPatternMatch(this.$id, matched, is.offset, currentIs) :
             new DismatchReport(this.$id, is);
    }
}

/**
 * Inspired by Snobol BREAK: http://www.snobol4.org/docs/burks/tutorial/ch4.htm
 * BREAK(S) matches "up to but not including" any character in S.
 * The string matched must always be followed in the subject by a character in S.
 * Unlike SPAN and NOTANY, BREAK will match the null string.
 */
export class Break implements MatchingLogic {

    constructor(public breakOn: string) {
    }

    public $id = `Break[${this.breakOn}]`;

    matchPrefix(is: InputState): MatchPrefixResult {
        if (is.exhausted())
            return emptyMatch(is);

        let currentIs = is;
        let matched = "";
        while (!currentIs.exhausted() && this.breakOn.indexOf(currentIs.peek()) == -1) {
            matched += currentIs.peek();
            currentIs = currentIs.advance();
        }
        return new TerminalPatternMatch(this.$id, matched, is.offset, currentIs);
    }
}