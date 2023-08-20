import { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error: "When possible, keep if condition on one line",
    },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    IfStatement(node) {
      if (
        node.alternate === null &&
        node.parent.type !== "IfStatement" &&
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

export const cases: Cases = {
  valid: [
    {
      name: "80 chars line",
      code: '  if (value === 0) return "Lorem ipsum dolor sit amet, consectetur adipisicing";',
    },
    {
      name: "Splitted 81 chars line",
      code: `  if (value === 0) {
    return "Lorem ipsum dolor sit amet, consectetur adipisicing ";
  }`,
    },
    {
      name: "if/else",
      code: `  if (value === 0) {
    console.log("Lorem ipsum dolor sit amet");
  } else {
    console.log("Lorem ipsum dolor sit");
  }`,
    },
    {
      name: "Multiline if condition",
      code: `if (
    // Some comment
    value === 0
  ) {
    return 3;
  }`,
    },
    {
      name: "Empty statement",
      code: `if (value === 0) {
    
  }`,
    },
  ],
  invalid: [
    {
      name: "Splitted 80 chars line",
      code: `  if (value === 0) {
    return "Lorem ipsum dolor sit amet, consectetur adipisicing";
  }`,
      fixOutput:
        '  if (value === 0) return "Lorem ipsum dolor sit amet, consectetur adipisicing";',
    },
  ],
};
