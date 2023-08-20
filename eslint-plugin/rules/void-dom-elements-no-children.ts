import { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "This DOM element cannot receive children." },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXElement(node) {
      if (
        node.children.length > 0 &&
        node.openingElement.name.type === "JSXIdentifier" &&
        voidElements.has(node.openingElement.name.name)
      ) {
        context.report({ node, messageId: "error" });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "Non void element",
      code: "<div>Foo</div>",
    },
    {
      name: "Void dom element without children",
      code: "<br />",
    },
  ],
  invalid: [
    {
      name: "Void dom element with children",
      code: "<br>Foo</br>",
    },
  ],
};
