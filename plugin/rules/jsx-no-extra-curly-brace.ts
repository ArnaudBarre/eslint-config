import type { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

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
        if (node.expression.raw.toString().includes("\\")) return;
        if (node.parent.type === "JSXAttribute") {
          context.report({
            node,
            messageId: "error",
            fix: (fixer) => [
              fixer.removeRange([node.range[0], node.range[0] + 1]),
              fixer.removeRange([node.range[1] - 1, node.range[1]]),
            ],
          });
        } else {
          if (needJSXEscape.test(node.expression.value)) return;
          if (context.sourceCode.getCommentsInside(node).length) return;
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

// Trailing whitespaces or HTML entities or backslash or JSX disallow characters
const needJSXEscape = /^\s|\s$|(&[A-Za-z\d#]+;)|[{<>}]/u;

export const cases: Cases = {
  valid: [
    {
      name: "Literal value",
      code: '<Comp bar="baz" />',
    },
    {
      name: "Template string",
      // eslint-disable-next-line no-template-curly-in-string
      code: "<Comp bar={`foo ${baz}`} />",
    },
    {
      name: "Node with trailing space start",
      code: '<Comp>{" bar"}</Comp>',
    },
    {
      name: "Node with trailing space end",
      code: '<Comp>{"bar "}</Comp>',
    },
    {
      name: "JSX in attribute value",
      code: "<Comp bar={<div />} />",
    },
    {
      name: "Attribute with escape",
      code: '<Comp bar={"line\\nbreak"} />',
    },
    {
      name: "Node with HTML entity",
      code: '<Comp>{"&nbsp;"}</Comp>',
    },
    {
      name: "Node with disallow JSX char",
      code: '<style>{".div { margin: 0 }"}</style>',
    },
    {
      name: "Node with escape",
      code: '<Comp>{"line\\nbreak"}</Comp>',
    },
    {
      name: "Node with comment",
      code: '<Comp>{/* comment */ "foo"}</Comp>',
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
