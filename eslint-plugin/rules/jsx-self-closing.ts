import { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "Prefer self-closing shorthand" },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXElement(node) {
      if (!node.openingElement.selfClosing && node.children.length === 0) {
        context.report({
          node,
          messageId: "error",
          fix: (fixer) =>
            fixer.replaceTextRange(
              [node.openingElement.range[1] - 1, node.closingElement!.range[1]],
              " />",
            ),
        });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "self-closing",
      code: "<div />",
    },
    {
      name: "self-closing with attributes",
      code: '<div id="foo" />',
    },
    {
      name: "Space children",
      code: "<div> </div>",
    },
  ],
  invalid: [
    {
      name: "non self-closing",
      code: "<div></div>",
      fixOutput: "<div />",
    },
  ],
};
