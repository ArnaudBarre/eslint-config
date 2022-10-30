import { TSESLint } from "@typescript-eslint/utils";

export const rule: TSESLint.RuleModule<"error" | "suggestion"> = {
  meta: {
    messages: {
      error:
        "Prefer jsx interpolation to template string to reduce the number of special characters. Ex: {`Hello ${name}`} -> Hello {name}",
      suggestion: "Simplify",
    },
    type: "suggestion",
    hasSuggestions: true,
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXExpressionContainer: (node) => {
      if (node.expression.type !== "TemplateLiteral") return;
      if (node.parent?.type === "JSXAttribute") return;
      const quasis = node.expression.quasis;
      if (quasis[0].value.raw.match(/^\s/u)) return;
      if (quasis[quasis.length - 1].value.raw.match(/\s$/u)) return;
      context.report({
        messageId: "error",
        node,
        suggest: [
          {
            messageId: "suggestion",
            fix(fixer) {
              const code = context.getSourceCode().getText(node);
              return fixer.replaceTextRange(
                node.range,
                code
                  .slice(code.indexOf("`") + 1, code.lastIndexOf("`"))
                  .replace(/\$/g, ""),
              );
            },
          },
        ],
      });
    },
  }),
};
