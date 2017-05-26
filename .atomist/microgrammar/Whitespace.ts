
import { Regex } from "./Primitives";
import { InputState } from "./InputState";
import { MatchingLogic, PatternMatch } from "./PatternMatch";

/**
 * Consume any white space, returning the content consumed and resulting input state
 * @param is
 */
export function consumeWhitespace(is: InputState): [string, InputState] {
    return discard(is, WHITESPACE_EATER);
}

/**
 * Discard the given matching
 * @param is
 * @param m
 * @returns {any}
 */
export function discard(is: InputState, m: MatchingLogic): [string, InputState] {
    const eaten = m.matchPrefix(is);
    if (eaten.$isMatch) {
        const pm = eaten as PatternMatch;
        return [pm.$matched,pm.$resultingInputState];
    }
    else {
        return ["", is];
    }
}

class WhitespaceEater extends Regex {

    constructor() {
        super(WHITESPACE_REGEX);
    }
}

const WHITESPACE_REGEX = /^\s*/;

const WHITESPACE_EATER = new WhitespaceEater();