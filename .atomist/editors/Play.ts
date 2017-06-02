import { RichTextTreeNode } from "@atomist/rug/ast/TextTreeNodeOps";
import { File } from "@atomist/rug/model/File";
import { Project } from "@atomist/rug/model/Project";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { FormatInfo, PointFormatInfo, TextTreeNode } from "@atomist/rug/tree/PathExpression";
import * as TreeHelper from "@atomist/rug/tree/TreeHelper";

@Editor("Play", "learn about editors")
@Tags("satellite-of-love", "jess")
export class Play implements EditProject {

    public edit(project: Project) {
        const positionOfInterest: Position = { line: 8, column: 5 };
        const endPositionOfInterest: Position = { line: 8, column: 18 };

        const identifierPosition: Position = { line: 8, column: 5 };

        const grammarPX = "/Elm()";

        const filepathOfInterest = "src/Main.elm";
        const fileOfInterest = project.findFile(filepathOfInterest);
        if (fileOfInterest == null) {
            throw new Error(`File not found: ${filepathOfInterest}`);
        }

        console.log(`Seeking a path expression that will extract (at least) positions ` +
            `${stringifyPosition(positionOfInterest)}-${stringifyPosition(endPositionOfInterest)} ` +
            `from ${filepathOfInterest}` +
            `, qualified on the value including ${stringifyPosition(identifierPosition)}`);

        const pxe = project.context.pathExpressionEngine;
        let found: string;

        try {
            pxe.with<RichTextTreeNode>(fileOfInterest, grammarPX, (top) => {

                const nodeToRetrieve: TextTreeNode =
                    smallestNodeThatContains(
                        [positionOfInterest, endPositionOfInterest], top.children() as TextTreeNode[]);
                const outerAddress =
                    TreeHelper.findPathFromAncestor(nodeToRetrieve, (tn) => tn.nodeName() === top.nodeName());

                const identifyingNode =
                    smallestNodeThatContains([identifierPosition], nodeToRetrieve.children() as TextTreeNode[]);
                // console.log(
                // `The identifying node is called ${identifyingNode.nodeName()},
                //  with value ${identifyingNode.value() }`);

                let found;
                if (identifyingNode === nodeToRetrieve) {
                    found = `${grammarPX}${outerAddress}[@value='${identifyingNode.value()}']`;
                } else {
                    const innerAddress =
                        TreeHelper.findPathFromAncestor(identifyingNode, (n) => sameNode(n, nodeToRetrieve));
                    // console.log(`and inner address ${innerAddress}`)
                    found = `${grammarPX}${outerAddress}[${innerAddress}[@value='${identifyingNode.value()}']]`;
                }
                console.log(`This path expression:
                ${found}`);

            });
        } catch (e) {
            console.log(`problem: ${e}`);
            // e.printStackTrace();
        }

        if (found != null) {
            const result = pxe.evaluate(fileOfInterest, found);
            result.matches.forEach((m) => {
                const t = m as TextTreeNode;
                console.log("yields: \n" + t.value());
            });
        }

    }
}

function samePointFormatInfo(pfi1: FormatInfo, pfi2: FormatInfo) {
    if (pfi1.start.offset !== pfi2.start.offset) return false;
    if (pfi1.end.offset !== pfi2.end.offset) return false;
    return true;
}

function sameNode(n1: TextTreeNode, n2: TextTreeNode) {
    // Rod: what's a better way to identify the relevant ancestor node?
    if (!samePointFormatInfo(n1.formatInfo, n2.formatInfo)) return false;
    if (n1.nodeName() !== n2.nodeName()) return false;
    return true;

}

function stringifyFormatInfo(pfi: FormatInfo): string {
    return `[${pfi.start.lineNumberFrom1},${pfi.start.columnNumberFrom1}]-[${pfi.end.lineNumberFrom1},${pfi.end.columnNumberFrom1}]`;
}

interface Position { line: number; column: number; }

function stringifyPosition(pfi: Position): string {
    return `[${pfi.line},${pfi.column}]`;
}

function smallestNodeThatContains(pos: Position[], nodes: TextTreeNode[]): TextTreeNode {
    const c = nodes.filter((n) => pos.every((p) => contains(p, n)));
    if (c.length < 1) return null;
    const containing = c[0];
    if (containing.children().length === 0) return containing;
    const nextSmallest = smallestNodeThatContains(pos, containing.children() as TextTreeNode[]);
    if (nextSmallest == null) return containing;
    return nextSmallest;
}

function after(start: PointFormatInfo, here: Position): boolean {
    if (here.line < start.lineNumberFrom1) return false;
    if (start.lineNumberFrom1 < here.line) return true;
    if (here.line < start.columnNumberFrom1) return false;
    return true;
}

function before(end: PointFormatInfo, here: Position): boolean {
    if (end.lineNumberFrom1 < here.line) return false;
    if (here.line < end.lineNumberFrom1) return true;
    if (end.columnNumberFrom1 < here.column) return false;
    return true;
}
function contains(pos: Position, node: TextTreeNode): boolean {
    return after(node.formatInfo.start, pos) && before(node.formatInfo.end, pos);
}

export const play = new Play();
