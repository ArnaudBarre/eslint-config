import { TSESLint } from "@typescript-eslint/utils";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error: "When possible, keep if condition on one line",
    },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  create: (context) => ({
    IfStatement: (node) => {
      if (
        node.alternate === null &&
        node.parent?.type !== "IfStatement" &&
        node.test.loc.start.line === node.test.loc.end.line &&
        node.consequent.loc.end.line === node.test.loc.start.line + 2 &&
        node.consequent.type === "BlockStatement" &&
        node.consequent.body.length > 0 && // Empty body handled by no-empty
        node.test.loc.end.column + getLength(node.consequent.body[0].range) < 79
      ) {
        const body = node.consequent.body[0];
        context.report({
          node,
          messageId: "error",
          fix: (fixer) => [
            fixer.removeRange([node.consequent.range[0], body.range[0]]),
            fixer.removeRange([body.range[1], node.consequent.range[1]]),
          ],
        });
      }
    },
  }),
};

const getLength = ([start, end]: [number, number]) => end - start;
