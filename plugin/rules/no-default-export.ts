import type { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "Prefer named exports" },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    if (context.filename.includes(".config.")) return {};
    return {
      ExportDefaultDeclaration(node) {
        context.report({ node, messageId: "error" });
      },
      ExportNamedDeclaration(node) {
        if (
          node.specifiers.some(
            (specifier) =>
              specifier.exported.type === "Identifier"
              && specifier.exported.name === "default",
          )
        ) {
          context.report({ node, messageId: "error" });
        }
      },
    };
  },
};

export const cases: Cases = {
  valid: [
    {
      name: "Named export",
      code: "export const foo = 3;",
    },
  ],
  invalid: [
    {
      name: "No default",
      code: "const foo = 3; export default foo;",
    },
    {
      name: "No named default",
      code: "const foo = 3; export { foo as default };",
    },
  ],
};
