import { InputState } from "./InputState";

/**
 * Pattern match. Holds user properties, with user-defined names,
 * and Atomist pattern match properties with a $ prefix.
 * Note that properties use $ prefix to get them out of user space,
 * as user properties will be added.
 */
export interface MatchPrefixResult {

    readonly $offset: number;

    readonly $isMatch: boolean;

    /**
     * Will be same as we started with if it's a dismatch
     */
    readonly $resultingInputState: InputState;

    readonly $matcherId: string;

}

export class DismatchReport implements MatchPrefixResult {

    public constructor(public readonly $matcherId: string, private is: InputState) {
    }

    public $isMatch = false;

    public $offset = this.is.offset;

    public $resultingInputState = this.is;

}

/**
 * Tag interface for anything that can contain matches
 */
export interface Term {

    readonly $id: string;
}

export const AnonymousDefinition: Term = {

    $id: "AnonymousDefinition"
};

/**
 * Anonymous matcher
 */
export interface MatchingLogic extends Term {

    matchPrefix(is: InputState): MatchPrefixResult;
}

/**
 * Matching logic associated with a name
 */
export interface Matcher extends MatchingLogic {

    readonly name: string;

}

export abstract class PatternMatch implements MatchPrefixResult {

    public $isMatch = true;

    /**
     * Represents a match
     * @param $matched the actual string content
     * @param $offset
     * @param $resultingInputState
     */
    constructor(public readonly $matcherId: string,
                public readonly $matched: string,
                public readonly $offset: number,
                public readonly $resultingInputState: InputState) {}

    /**
     * @return the $value that is extracted from this matcher. May be a
     * scalar or an array, or a nested structure
     */
    public readonly $value: any;

}

export class TerminalPatternMatch extends PatternMatch {

    constructor($matcherId: string,
                $matched: string,
                $offset: number,
                $resultingInputState: InputState,
                public readonly $value: any = $matched) {
       super($matcherId, $matched, $offset, $resultingInputState);
    }

}

/**
 * Properties we add to a matched node
 */
export interface MatchInfo {

    $match: PatternMatch;

}

/**
 * Suffix for properties parallel to string properties that we can't enrich,
 * as they aren't objects
 * @type {string}
 */
const MATCH_INFO_SUFFIX = "$match";

/**
 * Represents a complex pattern match. Sets properties to expose structure.
 * In the case of string properties, where we can't add a $match, we expose a parallel
 * <propertyName>$match property with that information.
 */
export class TreePatternMatch extends PatternMatch {

    public readonly $value;

    constructor($matcherId: string,
                $matched: string,
                $offset: number,
                $resultingInputState: InputState,
                public $matchers: Matcher[],
                public $subMatches: PatternMatch[]) {
        super($matcherId, $matched, $offset, $resultingInputState);
        this.$value = {};
        // TODO address code duplication with prepare method
        for (let i = 0; i < $subMatches.length; i++) {
            this.prepareMatch($matchers[i].name, $subMatches[i]);
            const value = $subMatches[i].$value;
            (this as any)[$matchers[i].name] = value;
            this.$value[$matchers[i].name] = value;
            if (typeof value === "object") {
                const mn = this.$value[$matchers[i].name] as MatchInfo;
                mn.$match = $subMatches[i];
            }
            else {
               this.$value[$matchers[i].name + MATCH_INFO_SUFFIX] = $subMatches[i];
            }
        }
    }

    private prepareMatch(name: string, pm: PatternMatch) {
        const pma = pm as any;
        (pm as any)[name] = pm.$matched;
        if (pma.subMatchers) {
            for (let i = 0; i < pma.subMatches.length; i++) {
                this.prepareMatch(pma.matchers[i].name, pma.subMatches[i]);
                (this as any)[pma.matchers[i].name] = pma.subMatches[i].$value;
                if (typeof pma.subMatches[i].$value != "string") {
                    (this as any)[pma.matchers[i].name].$match = pma.subMatches[i];
                }
                const value = pma.subMatches[i].$value;
                this.$value[pma.matchers[i].name] = value;
                if (typeof value === "object") {
                    const mn = value as MatchInfo;
                    mn.$match = pma.subMatches[i].$matched;
                }
                else {
                    this.$value[pma.matchers[i].name + MATCH_INFO_SUFFIX] = pma.subMatches[i];
                }
            }
        }
        return pm;
    }

}
