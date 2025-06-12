import type { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error:
        '+"string" can be dangerous when used in string concatenation. Prefer Number("string") instead.',
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    UnaryExpression(node) {
      if (node.operator === "+") context.report({ node, messageId: "error" });
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "String concatenation",
      code: "const foo = '1' + '2'",
    },
  ],
  invalid: [
    {
      name: "Unary plus",
      code: "const foo = +'1'",
    },
  ],
};
