import type { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "Unexpected alert." },
    type: "problem",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression(node) {
      if (node.callee.type === "Identifier" && node.callee.name === "alert") {
        const reference = context.sourceCode
          .getScope(node)
          .references.find(
            (ref) =>
              ref.identifier.range[0] === node.callee.range[0]
              && ref.identifier.range[1] === node.callee.range[1],
          );
        const isShadowed = (reference?.resolved?.defs.length ?? 0) > 0;
        if (!isShadowed) context.report({ node, messageId: "error" });
      }
      if (
        node.callee.type === "MemberExpression"
        && node.callee.object.type === "Identifier"
        && node.callee.object.name === "window"
        && node.callee.property.type === "Identifier"
        && node.callee.property.name === "alert"
      ) {
        context.report({ node, messageId: "error" });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "alert variable",
      code: "alert",
    },
    {
      name: "shadowed alert",
      code: "const alert = () => {}; alert('foo')",
    },
  ],
  invalid: [
    {
      name: "alert",
      code: "alert('foo')",
    },
    {
      name: "window.alert",
      code: "window.alert('foo')",
    },
  ],
};
