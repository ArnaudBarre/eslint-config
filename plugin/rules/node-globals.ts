import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"uselessImport" | "useGlobalThis"> = {
  meta: {
    messages: {
      uselessImport: "Use global instead",
      useGlobalThis: "Use globalThis instead",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const reportSpecifiers = (
      node: TSESTree.ImportDeclaration,
      names: string[],
    ) => {
      const specifier = node.specifiers.find(
        (s) =>
          s.type === "ImportSpecifier"
          && s.imported.type === "Identifier"
          && names.includes(s.imported.name),
      );
      if (specifier) {
        context.report({ node: specifier, messageId: "uselessImport" });
      }
    };

    return {
      ImportDeclaration(node) {
        switch (node.source.value) {
          case "process":
          case "node:process":
          case "console":
          case "node:console":
            context.report({ node, messageId: "uselessImport" });
            break;
          case "buffer":
          case "node:buffer":
            reportSpecifiers(node, ["Buffer"]);
            break;
          case "util":
          case "node:util":
            reportSpecifiers(node, ["TextEncoder", "TextDecoder"]);
            break;
          case "url":
          case "node:url":
            reportSpecifiers(node, ["URL", "URLSearchParams"]);
            break;
          default:
            break;
        }
      },
      MemberExpression(node) {
        if (
          node.object.type === "Identifier"
          && node.object.name === "global"
        ) {
          context.report({ node, messageId: "useGlobalThis" });
        }
      },
      BinaryExpression(node) {
        if (
          node.operator === "in"
          && node.right.type === "Identifier"
          && node.right.name === "global"
        ) {
          context.report({ node, messageId: "useGlobalThis" });
        }
      },
    };
  },
};

export const cases: Cases = {
  valid: [
    {
      name: "Other named export",
      code: 'import { fileURLToPath } from "url";',
    },
  ],
  invalid: [
    {
      name: "Ban module",
      code: 'import "process";',
      errorId: "uselessImport",
    },
    {
      name: "With node prefix",
      code: 'import * as csl from "node:console";',
      errorId: "uselessImport",
    },
    {
      name: "Named export",
      code: 'import { URL } from "url";',
      errorId: "uselessImport",
    },
    {
      name: "Renamed export",
      code: 'import { URL as Foo } from "url";',
      errorId: "uselessImport",
    },
    {
      name: "Global in binary expression",
      code: "foo in global;",
      errorId: "useGlobalThis",
    },
    {
      name: "Global in member expression",
      code: "global.foo;",
      errorId: "useGlobalThis",
    },
  ],
};
