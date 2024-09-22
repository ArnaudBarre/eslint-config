import type { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "Prefer boolean shorthand" },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXAttribute(node) {
      if (
        node.value?.type === "JSXExpressionContainer" &&
        node.value.expression.type === "Literal" &&
        node.value.expression.value === true
      ) {
        context.report({
          node,
          messageId: "error",
          fix: (fixer) =>
            fixer.removeRange([node.name.range[1], node.range[1]]),
        });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "Boolean shorthand",
      code: "const foo = <Comp bar />",
    },
    {
      name: "With false",
      code: "const foo = <Comp bar={false} />",
    },
  ],
  invalid: [
    {
      name: "Boolean value",
      code: "const foo = <Comp bar={true} />",
      errorId: "error",
      fixOutput: "const foo = <Comp bar />",
    },
  ],
};
