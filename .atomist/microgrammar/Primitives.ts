import { DismatchReport, MatchingLogic, MatchPrefixResult, TerminalPatternMatch } from "./PatternMatch";
import { InputState } from "./InputState";

/**
 * Match a literal string
 */
export class Literal implements MatchingLogic {

    constructor(public literal: string) {
    }

    public $id = `Literal[${this.literal}]`;

    public matchPrefix(is: InputState): MatchPrefixResult {
        const maybe = is.consume(this.literal);
        return (maybe) ?
            new TerminalPatternMatch(this.$id, this.literal, is.offset, maybe) :
            new DismatchReport(this.$id, is);
    }
}

export abstract class AbstractRegex implements MatchingLogic {

    protected log = false;

    constructor(public regex: RegExp) {
    }

    public $id = `Regex[${this.regex.source}]`;

    public matchPrefix(is: InputState): MatchPrefixResult {
        const remainder = is.remainder();
        const results: RegExpExecArray = this.regex.exec(remainder);
        if (this.log) {
            console.log(`AbstractRegex match for ${this.regex} in [${is.remainder().substring(0,10)}...] was [${results}]`)
        }

        if (results && results.length > 0 && results[0]) {
            return new TerminalPatternMatch(this.$id, results[0], is.offset, is.consume(results[0]),
                this.toValue(results[0]));
        }
        else
            return new DismatchReport(this.$id, is);
    }

    protected abstract toValue(s: string): any;
}

/**
 * Match a regular expression.
 * You may want to use a start anchor, but not an end anchor.
 */
export class Regex extends AbstractRegex {

    constructor(public regex: RegExp) {
        super(regex);
    }

    protected toValue(s: string) {
        return s;
    }
}

class MatchInteger extends AbstractRegex {

    constructor() {
        super(/^[1-9][0-9]*/);
    }

    protected toValue(s: string) {
        return parseInt(s);
    }

}

/**
 * Match an integer. Leading 0 not permitted
 */
export const Integer = new MatchInteger();

class MatchFloat extends AbstractRegex {

    constructor() {
        super(/^[+-]?\d*[\.]?\d+/);
    }

    protected toValue(s: string) {
        return parseFloat(s);
    }

}

/**
 * Match a float.
 */
export const Float = new MatchFloat();
