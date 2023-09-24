import type { RegExpVisitor } from "@eslint-community/regexpp/visitor"
import type { RegExpContext } from "../utils"
import { createRule, defineRegexpVisitor, getQuantifierOffsets } from "../utils"

export default createRule("no-useless-exactly-quantifier", {
    meta: {
        docs: {
            description: "disallow unnecessary exactly quantifier",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected quantifier '{{expr}}'.",
        },
        type: "suggestion", // "problem",
        deprecated: true,
        replacedBy: ["no-useless-quantifier", "no-zero-quantifier"],
    },
    create(context) {
        function createVisitor({
            node,
            getRegexpLocation,
        }: RegExpContext): RegExpVisitor.Handlers {
            return {
                onQuantifierEnter(qNode) {
                    if (
                        qNode.min === qNode.max &&
                        (qNode.min === 0 || qNode.min === 1)
                    ) {
                        const [startOffset, endOffset] =
                            getQuantifierOffsets(qNode)
                        const text = qNode.raw.slice(startOffset, endOffset)
                        context.report({
                            node,
                            loc: getRegexpLocation(qNode, [
                                startOffset,
                                endOffset,
                            ]),
                            messageId: "unexpected",
                            data: {
                                expr: text,
                            },
                        })
                    }
                },
            }
        }

        return defineRegexpVisitor(context, {
            createVisitor,
        })
    },
})