import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "Use global instead" },
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
        (s) => s.type === "ImportSpecifier" && names.includes(s.imported.name),
      );
      if (specifier) context.report({ node: specifier, messageId: "error" });
    };

    return {
      ImportDeclaration(node) {
        switch (node.source.value) {
          case "process":
          case "node:process":
          case "console":
          case "node:console":
            context.report({ node, messageId: "error" });
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
    },
    {
      name: "With node prefix",
      code: 'import * as csl from "node:console";',
    },
    {
      name: "Named export",
      code: 'import { URL } from "url";',
    },
    {
      name: "Renamed export",
      code: 'import { URL as Foo } from "url";',
    },
  ],
};
