import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, relative } from "node:path";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<
  | "selfImport"
  | "unresolved"
  | "duplicate"
  | "first"
  | "uselessPathSegments"
  | "suggestion"
  | "noImportDefaultAsNamed"
  | "noExportDefaultAsNamed"
> = {
  meta: {
    messages: {
      selfImport: "Module imports itself",
      unresolved: "Unresolved import",
      duplicate: "Duplicate import",
      first: "Imports should at the top of the file",
      uselessPathSegments:
        'Useless path segments for "{{ importPath }}", should be "{{ shortPath }}"',
      suggestion: "Simplify",
      noImportDefaultAsNamed: "Don't use named import for default import",
      noExportDefaultAsNamed: "Don't use named export for default export",
    },
    type: "problem",
    hasSuggestions: true,
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    if (!isAbsolute(context.filename)) {
      throw new Error("context.filename is not absolute");
    }
    const topLevelImports = new Set<TSESTree.ImportDeclaration>();
    const sources = new Set<string>();
    return {
      Program(node) {
        let foundNonExport = false;
        for (const statement of node.body) {
          if (statement.type === "ImportDeclaration") {
            topLevelImports.add(statement);
            if (sources.has(statement.source.value)) {
              context.report({ messageId: "duplicate", node: statement });
            }
            sources.add(statement.source.value);
            if (foundNonExport) {
              context.report({ messageId: "first", node: statement });
            }
          } else {
            foundNonExport = true;
          }
        }
      },
      ImportDeclaration(node) {
        if (node.parent.type === "TSModuleBlock") return;
        if (!topLevelImports.has(node)) {
          context.report({ messageId: "first", node });
          return;
        }

        const defaultSpecifier = node.specifiers.find(
          (specifier) =>
            specifier.type === "ImportSpecifier"
            && specifier.imported.type === "Identifier"
            && specifier.imported.name === "default",
        );
        if (defaultSpecifier) {
          context.report({
            messageId: "noImportDefaultAsNamed",
            node: defaultSpecifier,
          });
        }

        const rawValue = node.source.value;
        if (!rawValue.startsWith(".")) return;
        const queryStringIndex = rawValue.indexOf("?");
        const value =
          queryStringIndex === -1
            ? rawValue
            : rawValue.slice(0, queryStringIndex);

        if (!value.split("/").pop()!.includes(".")) {
          context.report({ messageId: "unresolved", node });
          return;
        }

        const filename = context.filename.split("/").pop()!;
        if (value === `./${filename}`) {
          context.report({ messageId: "selfImport", node });
          return;
        }

        const importerDir = dirname(context.filename);
        const importedPath = join(importerDir, value);
        let expected = relative(importerDir, importedPath);
        if (countParents(value) > countParents(expected)) {
          if (!expected.startsWith(".")) expected = `./${expected}`;
          context.report({
            messageId: "uselessPathSegments",
            node,
            data: { importPath: value, shortPath: expected },
            suggest: [
              {
                messageId: "suggestion",
                fix: (fixer) =>
                  fixer.replaceTextRange(
                    [node.source.range[0] + 1, node.source.range[1] - 1],
                    expected,
                  ),
              },
            ],
          });
          return;
        }

        if (!existsSync(importedPath)) {
          context.report({ messageId: "unresolved", node });
        }
      },
      ExportNamedDeclaration(node) {
        const defaultSpecifier = node.specifiers.find(
          (specifier) =>
            specifier.exported.type === "Identifier"
            && specifier.exported.name === "default",
        );
        if (defaultSpecifier) {
          context.report({
            messageId: "noExportDefaultAsNamed",
            node: defaultSpecifier,
          });
        }
      },
    };
  },
};

const countParents = (path: string) =>
  path.split("/").filter((x) => x === "..").length;

export const cases: Cases = {
  valid: [
    {
      name: "Explicit import",
      code: "import './mock2.tsx';",
    },
    {
      name: "With query string",
      code: "import './mock2.tsx?raw';",
    },
    {
      name: "Dynamic import",
      code: "if (1) await import('./mock2.tsx');",
    },
    {
      name: "Import parent",
      code: "import '../mock2.tsx';",
      fileName: "mock-folder/mock3.tsx",
    },
    {
      name: "Import parent from nested",
      code: "import '../mock3.tsx';",
      fileName: "mock-folder/nested/mock4.tsx",
    },
    {
      name: "Import parent parent",
      code: "import '../../mock.tsx';",
      fileName: "mock-folder/nested/mock4.tsx",
    },
    {
      name: "Import inside module declaration",
      code: `
declare module "*.svg" {
  import { FunctionComponent, SVGProps } from "react";
  const ReactComponent: FunctionComponent<
    SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}`,
    },
  ],
  invalid: [
    {
      name: "Self import",
      code: "import './mock.tsx';",
      errorId: "selfImport",
    },
    {
      name: "Useless path segments sibling",
      code: "import '../tests/mock2.tsx';",
      errorId: "uselessPathSegments",
      suggestionOutput: "import './mock2.tsx';",
    },
    {
      name: "Useless path segments nested",
      code: "import '../tests/nested/mock2.tsx';",
      errorId: "uselessPathSegments",
      suggestionOutput: "import './nested/mock2.tsx';",
    },
    {
      name: "Useless path segments parent",
      code: "import '../../tests/mock2.tsx';",
      fileName: "mock-folder/mock3.tsx",
      errorId: "uselessPathSegments",
      suggestionOutput: "import '../mock2.tsx';",
    },
    {
      name: "First",
      code: "console.log(1); import './mock2.tsx';",
      errorId: "first",
    },
    {
      name: "Nested",
      code: "if (1) import './mock.tsx';",
      errorId: "first",
    },
    {
      name: "Duplicate",
      code: "import './mock2.tsx'; import { a } from './mock2.tsx';",
      errorId: "duplicate",
    },
    {
      name: "No extension",
      code: "import './mock2';",
      errorId: "unresolved",
    },
    {
      name: "Unresolved",
      code: "import './mock3.tsx';",
      errorId: "unresolved",
    },
    {
      name: "Default import as named",
      code: "import { default as a } from './mock2.tsx';",
      errorId: "noImportDefaultAsNamed",
    },
    {
      name: "Default export as named",
      code: "const a = 1; export { a as default };",
      errorId: "noExportDefaultAsNamed",
    },
  ],
};
