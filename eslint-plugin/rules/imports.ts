import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { join, dirname, relative, isAbsolute } from "path";
import { existsSync } from "fs";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<
  | "selfImport"
  | "unresolved"
  | "duplicate"
  | "first"
  | "uselessPathSegments"
  | "suggestion"
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
    },
    type: "problem",
    hasSuggestions: true,
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const path = context.getFilename();
    if (!isAbsolute(path)) {
      throw new Error("context.getFilename is not absolute");
    }
    const { tsconfigRootDir } = context.parserOptions;
    if (!tsconfigRootDir) throw new Error("tsconfigRootDir not set");
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
          console.log(node.parent.type);
          context.report({ messageId: "first", node });
          return;
        }

        const value = node.source.value;
        if (!value.startsWith(".")) return;

        if (!value.split("/").pop()!.includes(".")) {
          context.report({ messageId: "unresolved", node });
          return;
        }

        const filename = path.split("/").pop()!;
        if (value === `./${filename}`) {
          context.report({ messageId: "selfImport", node });
          return;
        }

        const importerDir = dirname(path);
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
      code: "import '../../eslint-plugin/mock2.tsx';",
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
  ],
};
