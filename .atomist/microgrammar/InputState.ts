
/**
 * Immutable
 */
export class InputState {

    constructor(public readonly content: string, public readonly offset: number = 0) {
        if (content === undefined) {
            throw new Error("Undefined content: offset=" + offset);
        }
    }

    public exhausted() {
        return this.offset >= this.content.length;
    }

    /**
     * State after consuming this at current position. Null if can't be consumed
     * @param s
     * @returns {InputState}
     */
    public consume(s: string): InputState {
        return (s && !this.exhausted() && this.remainder().indexOf(s) === 0) ?
            new InputState(this.content, this.offset + s.length) :
            null;
    }

    public remainder(): string {
        return this.content.substr(this.offset);
    }

    public advance(): InputState {
        return new InputState(this.content, this.offset + 1);
    }

    public peek(): string {
        return this.exhausted() ?
            null :
            this.content.charAt(this.offset);
    }

}
