import { TSESLint } from "@typescript-eslint/utils";
import { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "Curly braces are unnecessary here." },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXExpressionContainer(node) {
      if (
        node.expression.type === "Literal" &&
        typeof node.expression.value === "string"
      ) {
        if (node.parent.type === "JSXAttribute") {
          context.report({
            node,
            messageId: "error",
            fix: (fixer) => [
              fixer.removeRange([node.range[0], node.range[0] + 1]),
              fixer.removeRange([node.range[1] - 1, node.range[1]]),
            ],
          });
        } else if (node.expression.value.trim() === node.expression.value) {
          context.report({
            node,
            messageId: "error",
            fix: (fixer) => [
              fixer.removeRange([node.range[0], node.range[0] + 2]),
              fixer.removeRange([node.range[1] - 2, node.range[1]]),
            ],
          });
        }
      } else if (
        node.parent.type !== "JSXAttribute" &&
        (node.expression.type === "JSXElement" ||
          node.expression.type === "JSXFragment")
      ) {
        context.report({
          node,
          messageId: "error",
          fix: (fixer) => [
            fixer.removeRange([node.range[0], node.range[0] + 1]),
            fixer.removeRange([node.range[1] - 1, node.range[1]]),
          ],
        });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "Literal value",
      code: 'const foo = <Comp bar="baz" />',
    },
    {
      name: "Template string",
      // eslint-disable-next-line no-template-curly-in-string
      code: "const foo = <Comp bar={`foo ${baz}`} />",
    },
    {
      name: "Node with trailing space",
      code: 'const foo = <Comp>{" bar"}</Comp>',
    },
    {
      name: "JSX in attribute value",
      code: "const foo = <Comp bar={<div />} />",
    },
  ],
  invalid: [
    {
      name: "Extra braces",
      code: 'const foo = <Comp bar={"baz"} />',
      errorId: "error",
      fixOutput: 'const foo = <Comp bar="baz" />',
    },
    {
      name: "Extra braces for literal children",
      code: 'const foo = <Comp>{"bar"}</Comp>',
      errorId: "error",
      fixOutput: "const foo = <Comp>bar</Comp>",
    },
    {
      name: "Extra braces for jsx children",
      code: "const foo = <Comp>{<div />}</Comp>",
      errorId: "error",
      fixOutput: "const foo = <Comp><div /></Comp>",
    },
    {
      name: "Extra braces for jsx fragment in children",
      code: "const foo = <Comp>{<><div/><div/></>}</Comp>",
      errorId: "error",
      fixOutput: "const foo = <Comp><><div/><div/></></Comp>",
    },
  ],
};
