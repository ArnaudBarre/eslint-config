import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error:
        "Comments inside children section of tag should be placed inside braces",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const checkText = (node: TSESTree.JSXText | TSESTree.Literal) => {
      if (
        /^\s*\/[/*]/mu.test(node.raw) &&
        node.parent.type !== "JSXAttribute" &&
        node.parent.type.includes("JSX")
      ) {
        context.report({ node, messageId: "error" });
      }
    };

    return {
      Literal: checkText,
      JSXText: checkText,
    };
  },
};

export const cases: Cases = {
  valid: [
    {
      name: "Inside JSXContainer",
      code: "<div>{/* valid */}</div>",
    },
    {
      name: "Not a comment",
      code: "<div>Hello world</div>",
    },
    {
      name: "Between attributes",
      code: "<Foo /* valid */ foo={2} />",
    },
    {
      name: "Inside attribute",
      code: "<Foo foo={/* valid */ 2} />",
    },
  ],
  invalid: [
    {
      name: "Inside div",
      code: "<div>/* invalid */</div>",
    },
    {
      name: "Inside fragment",
      code: "<>/* invalid */</>",
    },
    {
      name: "Simple comment",
      code: `<div>
        // invalid
      </div>`,
    },
    {
      name: "Multiple text node",
      code: `<div>
        {/* valid */}
        Hello world
        // invalid
      </div>`,
    },
  ],
};
