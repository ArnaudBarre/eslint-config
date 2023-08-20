import { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"useShort"> = {
  meta: {
    messages: { useShort: "Prefer fragment shorthand" },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXElement(node) {
      if (
        node.closingElement && // Self-closing fragment are handle by uselessFragment
        node.openingElement.name.type === "JSXIdentifier" &&
        node.openingElement.name.name === "Fragment" &&
        !node.openingElement.attributes.length
      ) {
        context.report({
          node: node.openingElement,
          messageId: "useShort",
          fix: (fixer) => [
            fixer.replaceText(node.openingElement, "<>"),
            fixer.replaceText(node.closingElement!, "</>"),
          ],
        });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "Fragment with key",
      code: "const foo = <Fragment key={1} />",
    },
    {
      name: "Fragment short",
      code: "const foo = <></>",
    },
  ],
  invalid: [
    {
      name: "Fragment without attributes",
      code: "const foo = <Fragment>Hey</Fragment>",
      errorId: "useShort",
      fixOutput: "const foo = <>Hey</>",
    },
  ],
};
