import { DismatchReport, MatchingLogic, MatchPrefixResult, PatternMatch, TerminalPatternMatch } from "./PatternMatch";
import { InputState } from "./InputState";
import { toMatchingLogic } from "./Concat";
import { consumeWhitespace } from "./Whitespace";
import { Config, Configurable, DefaultConfig } from "./Config";


/**
 * Handle repetition, with or without a separator.
 * Prefer subclasses for simplicity and clarity.
 * By default, match zero or more times without a separator
 */
export class Repetition implements MatchingLogic, Configurable {

    private matcher: MatchingLogic;

    private sepMatcher: MatchingLogic;

    private config: Config = DefaultConfig;

    /**
     * Generic rep support. Normally use subclasses.
     * @param o matcher
     * @param min mininum number of times the matcher must match for this to be considered a match. Default 0
     * @param sep if this is provided it indicates that this is a rep sep and it is the delimiter
     */
    constructor(o: any, public min: number = 0, public sep: any = undefined) {
        this.matcher = toMatchingLogic(o);
        if (sep) {
            this.sepMatcher = toMatchingLogic(sep);
        }
    }

    public $id = `Rep[${this.matcher}:min=${this.min},sep=[${this.sep}]`;

    public withConfig(config: Config): this {
        this.config = config;
        return this;
    }

    public matchPrefix(is: InputState): MatchPrefixResult {
        let currentIs = is;
        let matches: PatternMatch[] = [];
        let matched = "";
        while (!currentIs.exhausted()) {
            if (this.config.consumeWhiteSpaceBetweenTokens) {
                const eaten = consumeWhitespace(currentIs);
                matched += eaten[0];
                currentIs = eaten[1];
            }
            const match = this.matcher.matchPrefix(currentIs);
            if (!match.$resultingInputState)
                throw new Error("Anomaly: Null input state");
            if (!match.$isMatch)
                break;
            const pm = match as PatternMatch;
            currentIs = pm.$resultingInputState;
            matches.push(pm);
            matched += pm.$matched;

            if (this.sepMatcher) {
                const eaten = consumeWhitespace(currentIs);
                matched += eaten[0];
                currentIs = eaten[1];
                const sepMatch = this.sepMatcher.matchPrefix(currentIs);
                if (sepMatch.$isMatch) {
                    currentIs = sepMatch.$resultingInputState;
                    matched += (sepMatch as PatternMatch).$matched;
                }
                else {
                    break;
                }
            }
        }
        return (matches.length >= this.min) ?
            new TerminalPatternMatch(this.$id,
                matched,
                is.offset,
                currentIs,
                matches.map(m => m.$value)) :
            new DismatchReport(this.$id, is);
    }
}

/**
 * Match 0 or more times, without a separator
 */
export class Rep extends Repetition {

    constructor(o: any) {
        super(o, 0);
    }
}

/**
 * Match 1 or more times
 */
export class Rep1 extends Repetition {

    constructor(o: any) {
        super(o, 1);
    }
}

export class RepSep extends Repetition {

    constructor(o: any, sep: any) {
        super(o, 0, sep);
    }
}

export class Rep1Sep extends Repetition {

    constructor(o: any, sep: any) {
        super(o, 1, sep);
    }
}

