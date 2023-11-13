import {
  parseRegExpLiteral,
  RegExpSyntaxError,
} from "@eslint-community/regexpp";
import { TSESLint } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

const messages = {
  invalid: "Invalid RegExp",
  useLiteral: "Change to literal RegExp",
};

export const rule: TSESLint.RuleModule<keyof typeof messages> = {
  meta: {
    messages,
    type: "problem",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    Literal(node) {
      if (!("regex" in node)) return;
      if (!node.value) {
        context.report({ node, messageId: "invalid" });
        return;
      }
      const result = validateRegExp(node.value);
      if (!result) return;
      if (typeof result === "string") {
        context.report({ node, messageId: result });
      } else {
        context.report({
          node,
          messageId: result.id,
          data: result.data,
          loc:
            result.index !== undefined
              ? {
                  start: {
                    line: node.loc.start.line,
                    column: node.loc.start.column + result.index,
                  },
                  end: {
                    line: node.loc.start.line,
                    column: node.loc.start.column + result.index + 1,
                  },
                }
              : undefined,
        });
      }
    },
    NewExpression(node) {
      if (node.callee.type === "Identifier" && node.callee.name === "RegExp") {
        const pattern = node.arguments.at(0);
        if (!pattern) return;
        if (pattern.type !== "Literal") return;
        if (typeof pattern.value !== "string") return;
        const flags = node.arguments.at(1);
        if (
          !flags ||
          (flags.type === "Literal" && typeof flags.value === "string")
        ) {
          context.report({ node, messageId: "useLiteral" });
        }
      }
    },
  }),
};

const validateRegExp = (
  value: RegExp,
):
  | keyof typeof messages
  | { id: keyof typeof messages; data?: Record<string, string>; index?: number }
  | undefined => {
  try {
    parseRegExpLiteral(value, { strict: true, ecmaVersion: 2023 });
  } catch (e) {
    if (e instanceof RegExpSyntaxError) {
      return { id: "invalid", index: e.index };
    }
    throw e;
  }
};

export const cases: Cases = {
  valid: [
    {
      name: "Valid regex literal",
      code: "const foo = /a{1,3}/",
    },
    {
      name: "Useful RegExp constructor",
      code: "const foo = new RegExp(bar, 'u')",
    },
  ],
  invalid: [
    {
      name: "Invalid regex literal",
      code: "const foo = /a{3,1}/",
      errorId: "invalid",
    },
    {
      name: "Useless RegExp constructor without flags",
      code: "const foo = new RegExp('a{1,3}')",
      errorId: "useLiteral",
    },
    {
      name: "Useless RegExp constructor with flags",
      code: "const foo = new RegExp('a{1,3}', 'u')",
      errorId: "useLiteral",
    },
  ],
};
