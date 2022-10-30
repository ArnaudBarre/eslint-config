import { TSESLint } from "@typescript-eslint/utils";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error: 'Prefer "" for string without interpolation',
    },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TemplateLiteral: (node) => {
      if (node.parent?.type === "TaggedTemplateExpression") return;
      if (node.quasis.length > 1) return;
      const value = node.quasis[0].value.raw;
      if (value.includes("'") && value.includes('"')) return;
      if (node.loc.start.line !== node.loc.end.line) return;
      const replacer = value.includes('"') ? "'" : '"';
      context.report({
        messageId: "error",
        node,
        fix: (fixer) => [
          fixer.replaceTextRange([node.range[0], node.range[0] + 1], replacer),
          fixer.replaceTextRange([node.range[1] - 1, node.range[1]], replacer),
        ],
      });
    },
  }),
};
