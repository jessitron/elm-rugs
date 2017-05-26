import {
    DismatchReport,
    Matcher,
    MatchingLogic,
    MatchPrefixResult,
    PatternMatch, Term,
    TreePatternMatch
} from "./PatternMatch";
import { InputState } from "./InputState";
import { consumeWhitespace } from "./Whitespace";
import { Literal, Regex } from "./Primitives";
import { Config, DefaultConfig } from "./Config";

/**
 * Represents something that can be passed into a microgrammar
 */
export type TermDef = Term | string | RegExp;

/**
 * Represents a concatenation of multiple matchers. This is the normal
 * way we compose matches.
 */
export class Concat implements MatchingLogic {

    private matchers: Matcher[] = [];

    constructor(private definitions: Term, public config: Config = DefaultConfig) {
        for (const matcherName in definitions) {
            if (matcherName != "$id") {
                const named = withName(toMatchingLogic(
                    definitions[matcherName]),
                    matcherName);
                this.matchers.push(named);
            }
        }
    }

    get $id() {
       return this.matchers.map(m => m.$id).join(",");
    }

    public matchPrefix(initialInputState: InputState): MatchPrefixResult {
        const matches: PatternMatch[] = [];
        let currentInputState = initialInputState;
        let matched = "";
        for (const m of this.matchers) {
            if (this.config.consumeWhiteSpaceBetweenTokens) {
                const eaten = consumeWhitespace(currentInputState);
                matched += eaten[0];
                currentInputState = eaten[1];
            }

            const report = m.matchPrefix(currentInputState);
            if (report.$isMatch) {
                const pm = report as PatternMatch;
                matches.push(pm);
                currentInputState = pm.$resultingInputState;
                matched += pm.$matched;
            }
            else {
                return new DismatchReport(this.$id, initialInputState);
            }
        }
        return new TreePatternMatch(
            this.$id,
            matched,
            initialInputState.offset,
            currentInputState,
            this.matchers,
            matches);
    }

}

/**
 * Turns a JSON element such as name: "literal" into a matcher
 * @param name of the created matcher
 * @param o
 * @returns {any}
 */
export function toMatchingLogic(o: TermDef): MatchingLogic {
    if (typeof o === "string") {
        return new Literal(o as string);
    }
    else if ((o as RegExp).exec) {
        return new Regex(o as RegExp);
    }
    else if ((o as MatchingLogic).matchPrefix) {
        // It's a matcher
        return o as MatchingLogic;
    }
    else {
        return new Concat(o as Term);
    }
}

function withName(ml: MatchingLogic, name: string): Matcher {
    return new MatcherWrapper(name, ml);
}

class MatcherWrapper implements Matcher {

    constructor(public name: string, private ml: MatchingLogic) {
    }

    public $id = this.name;

    public matchPrefix(is: InputState): MatchPrefixResult {
        // Remember to copy extra properties
        const mpr = this.ml.matchPrefix(is);
        //(mpr as any).name = this.name;
        return mpr;
    }
}