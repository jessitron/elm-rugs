import { MatchingLogic, PatternMatch, Term } from "./PatternMatch";
import { Concat, TermDef } from "./Concat";
import { InputState } from "./InputState";
import { consumeWhitespace } from "./Whitespace";
import { Config, DefaultConfig } from "./Config";

/**
 * Represents a microgrammar that we can use to match input.
 * Modifications are tracked and we can get an updated string
 * afterwards.
 */
export class Microgrammar {

    static fromDefinitions(name: string,
                           definitions: Term,
                           config: Config = DefaultConfig): Microgrammar {
        return new Microgrammar(name, new Concat(definitions, config), config);
    }

    constructor(public name: string, private matcher: MatchingLogic, private config: Config = DefaultConfig) {
    }

    /**
     * Convenience method to find matches without the ability to update them
     * @param content
     * @param stopAfterMatch() function that can cause matching to stop after a given match.
     * Often used to stop after one.
     * @return {PatternMatch[]}
     */
    public findMatches(content: string, stopAfterMatch: (PatternMatch) => boolean = pm => false): PatternMatch[] {
        const matches: PatternMatch[] = [];
        let currentInputState = new InputState(content);
        while (!currentInputState.exhausted()) {
            if (this.config.consumeWhiteSpaceBetweenTokens) {
                currentInputState = consumeWhitespace(currentInputState)[1];
            }
            const tryMatch = this.matcher.matchPrefix(currentInputState);
            if (tryMatch.$isMatch) {
                const pm = tryMatch as PatternMatch;
                // Enrich with the name
                (pm as any).$name = this.name;
                matches.push(pm);
                currentInputState = currentInputState.consume(pm.$matched);
                if (!currentInputState)
                    throw new Error(`Anomaly: Current input state is null`);
                if (stopAfterMatch(pm)) {
                    break;
                }
            }
            else {
                // We didn't match. Discard the current input character and try again
                currentInputState = currentInputState.advance();
            }
        }
        return matches;
    }

    /**
     * Convenient method to find the first match, or null if not found.
     * Stops searching after the first match.
     * @param content
     * @returns {PatternMatch[]}
     */
    public firstMatch(content: string): PatternMatch {
        const matches = this.findMatches(content, pm => true);
        return (matches.length > 0) ? matches[0] : null;
    }

    public findUpdatableMatches(content: string): UpdatableMatches {
        return new UpdatableMatches(content, this.findMatches(content));
    }

}

interface ValueHolder {

    $newValue: string;
}


/**
 * Represents updatable matches and the content behind them.
 */
export class UpdatableMatches {

    private changed: PatternMatch[] = [];

    constructor(public initialContent: string, public matches: PatternMatch[]) {
    }

    // TODO could add a proxy layer to perform this
    public update(pm: PatternMatch, newValue: string) {
        (pm as any as ValueHolder).$newValue = newValue;
        if (this.changed.indexOf(pm) == -1) {
            // Don't add twice
            this.changed.push(pm);
            // Keep sorted with latest first
            this.changed.sort((pm1, pm2) => pm2.$offset - pm1.$offset);
        }
    }

    public isDirty(): boolean {
        return this.changed.length > 0;
    }

    /**
     * Return an updated string following the recorded changes
     */
    public updated(): string {
        // Apply in reverse order
        let newContent = this.initialContent;
        for (const pm of this.changed) {
            const newValue = (pm as any as ValueHolder).$newValue;
            newContent =
                newContent.substring(0, pm.$offset) +
                newValue +
                newContent.substring(pm.$offset + pm.$matched.length);
        }
        return newContent;
    }
}