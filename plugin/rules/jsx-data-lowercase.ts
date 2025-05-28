import type { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "React requires data attributes to be lowercase" },
    type: "problem",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXAttribute(node) {
      if (
        node.name.type === "JSXIdentifier"
        && node.name.name.startsWith("data-")
        && node.name.name !== node.name.name.toLowerCase()
      ) {
        const lowercaseName = node.name.name.toLowerCase();
        context.report({
          node,
          messageId: "error",
          fix: (fixer) => fixer.replaceText(node.name, lowercaseName),
        });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "Lowercase data attribute",
      code: 'const foo = <Comp data-foo="bar" />',
    },
  ],
  invalid: [
    {
      name: "Data attribute",
      code: 'const foo = <Comp data-Foo="bar" />',
      errorId: "error",
      fixOutput: 'const foo = <Comp data-foo="bar" />',
    },
  ],
};
