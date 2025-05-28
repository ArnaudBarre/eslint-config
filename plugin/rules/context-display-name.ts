import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"missing" | "different"> = {
  meta: {
    messages: {
      missing: "Missing display name",
      different: "This should be identical to the variable name",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const contexts = new Map<
      string,
      { node: TSESTree.Identifier; hasDisplayName: boolean }
    >();
    return {
      "VariableDeclarator"(node) {
        if (
          node.init?.type === "CallExpression"
          && node.init.callee.type === "Identifier"
          && node.init.callee.name === "createContext"
          && node.id.type === "Identifier"
        ) {
          contexts.set(node.id.name, { node: node.id, hasDisplayName: false });
        }
      },
      "AssignmentExpression"(node) {
        if (
          node.left.type === "MemberExpression"
          && node.left.object.type === "Identifier"
          && contexts.has(node.left.object.name)
          && node.left.property.type === "Identifier"
          && node.left.property.name === "displayName"
        ) {
          contexts.get(node.left.object.name)!.hasDisplayName = true;
          if (
            node.right.type !== "Literal"
            || node.right.value !== node.left.object.name
          ) {
            context.report({ messageId: "different", node: node.right });
          }
        }
      },
      "Program:exit"() {
        for (const ctx of contexts.values()) {
          if (!ctx.hasDisplayName) {
            context.report({ messageId: "missing", node: ctx.node });
          }
        }
      },
    };
  },
};

export const cases: Cases = {
  valid: [
    {
      name: "Context with display name",
      code: 'const FormContext = createContext(null); FormContext.displayName = "FormContext";',
    },
  ],
  invalid: [
    {
      name: "Missing displayName",
      code: "const FormContext = createContext(null);",
      errorId: "missing",
    },
    {
      name: "Different displayName",
      code: 'const FormContext = createContext(null); FormContext.displayName = "Foo";',
      errorId: "different",
    },
  ],
};
