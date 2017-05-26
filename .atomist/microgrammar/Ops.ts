import { DismatchReport, MatchingLogic, MatchPrefixResult, PatternMatch, Term } from "./PatternMatch";
import { InputState } from "./InputState";
import { emptyMatch } from "./Utils";
import { TermDef, toMatchingLogic } from "./Concat";

export class Opt implements MatchingLogic {

    private matcher: MatchingLogic;

    constructor( o: any) {
        this.matcher = toMatchingLogic(o)
    }

    public $id = `Opt[${this.matcher}]`;

    public matchPrefix(is: InputState): MatchPrefixResult {
        if (is.exhausted()) {
            //console.log(`Match from Opt on exhausted stream`);
            return emptyMatch(is);
        }

        const maybe = this.matcher.matchPrefix(is);
        //console.log(`Result of trying Opt on [${is.remainder()}]=${JSON.stringify(maybe)}`);

        return (maybe.$isMatch) ?
            maybe :
            emptyMatch(is);
    }
}

/**
 * Matches either A or B but not neither
 */
export class Alt implements MatchingLogic {

    private matcherA: MatchingLogic;
    private matcherB: MatchingLogic;

    constructor(a: any, b: any) {
        this.matcherA = toMatchingLogic(a);
        this.matcherB = toMatchingLogic(b);
    }

    public $id = `Alt(${this.matcherA},${this.matcherB})`;

    public matchPrefix(is: InputState): MatchPrefixResult {
        if (is.exhausted()) {
            return new DismatchReport(this.$id, is);
        }

        const aMatch = this.matcherA.matchPrefix(is);
        //console.log(`Result of trying Opt on [${is.remainder()}]=${JSON.stringify(maybe)}`);
        if (aMatch.$isMatch)
            return aMatch;

        // Otherwise, try b
        const bMatch = this.matcherB.matchPrefix(is);
        return (bMatch.$isMatch) ?
            bMatch :
            new DismatchReport(this.$id, is);
    }
}

/**
 * Add a condition with a function that verifies that even if we found a match
 * we are happy with it: For example, we like the value it contains.
 */
export class When implements MatchingLogic {

    private matcher: MatchingLogic;

    constructor(matcher: any, private matchTest: (PatternMatch) => boolean) {
        this.matcher = toMatchingLogic(matcher);
    }

    public $id = `When[${this.matcher}]`;

    public matchPrefix(is: InputState): MatchPrefixResult {
        const match = this.matcher.matchPrefix(is);
        return (match.$isMatch && this.matchTest(match)) ?
            match :
            new DismatchReport(this.$id, is);
    }
}
