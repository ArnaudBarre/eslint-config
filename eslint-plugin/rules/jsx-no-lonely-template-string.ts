/* eslint-disable no-template-curly-in-string */
import { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

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
    JSXExpressionContainer(node) {
      if (node.expression.type !== "TemplateLiteral") return;
      if (node.parent.type === "JSXAttribute") return;
      const quasis = node.expression.quasis;
      if (quasis[0].value.raw.match(/^\s/u)) return;
      if (quasis.at(-1)!.value.raw.match(/\s$/u)) return;
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
                  .replaceAll("$", ""),
              );
            },
          },
        ],
      });
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "Template outside of jsx",
      code: "const template = `Some template ${3 + 3}`; return <>{template}</>",
    },
    {
      name: "Spaces start",
      code: "return <>{` Ok with space ${3 + 3}`}</>",
    },
    {
      name: "Spaces end",
      code: "return <>{`Ok with space ${3 + 3} at end `}</>",
    },
    {
      name: "Function call",
      code: "return <>{`Ok ${3 + 3}`.slice(1)}</>",
    },
    {
      name: "JSX attribute",
      code: "return <button className={`flex ${loading ? 'spin' : ''}`} />",
    },
  ],
  invalid: [
    {
      name: "Interpolation start",
      code: "return <>{`${3} not ok`}</>",
      suggestionOutput: "return <>{3} not ok</>",
    },
    {
      name: "Interpolation end",
      code: "return <>{`Not ok ${3 + 3}`}</>",
      suggestionOutput: "return <>Not ok {3 + 3}</>",
    },
    {
      name: "Interpolation only",
      code: "return <>{`${3}`}</>",
      suggestionOutput: "return <>{3}</>",
    },
  ],
};
