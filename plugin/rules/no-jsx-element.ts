import type { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error:
        "Prefer ReactNode which allows to use anything valid as React children (as of TS 5.1)",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TSQualifiedName(node) {
      if (
        node.left.type === "Identifier"
        && node.left.name === "JSX"
        && node.right.name === "Element"
      ) {
        context.report({ node, messageId: "error" });
      }
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "ReactNode",
      code: "type Foo = { children: ReactNode }",
    },
  ],
  invalid: [
    {
      name: "JSX.Element",
      code: "type Foo = { children: JSX.Element }",
    },
  ],
};
