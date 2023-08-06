import { TSESLint } from "@typescript-eslint/utils";
import { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error: "Only set one of `children` or `props.dangerouslySetInnerHTML`",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXElement(node) {
      if (
        (node.closingElement !== null ||
          node.openingElement.attributes.some(
            (a) => a.type === "JSXAttribute" && a.name.name === "children",
          )) &&
        node.openingElement.attributes.some(
          (a) =>
            a.type === "JSXAttribute" &&
            a.name.name === "dangerouslySetInnerHTML",
        )
      ) {
        context.report({ node, messageId: "error" });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "Only dangerouslySetInnerHTML",
      code: '<div dangerouslySetInnerHTML={{ __html: "HTML" }} />',
    },
    {
      name: "Only children",
      code: "<div>Children</div>",
    },
  ],
  invalid: [
    {
      name: "Both",
      code: '<div dangerouslySetInnerHTML={{ __html: "HTML" }}>Children</div>',
    },
    {
      name: "Both with children prop",
      code: '<div dangerouslySetInnerHTML={{ __html: "HTML" }} children="Children" />',
    },
  ],
};
