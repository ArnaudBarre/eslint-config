// Credit: @greg2451
// Most cases are already covered by react/no-unused-prop-types, but this rule
// also check for non React functions and add fix via suggestion
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error" | "suggestion"> = {
  meta: {
    messages: {
      error: "Unused property signature",
      suggestion: "Remove unused property signature",
    },
    type: "problem",
    hasSuggestions: true,
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const typeLiteralDefs: {
      name: string;
      members: TSESTree.TypeElement[];
      usedKeys: Set<string> | null;
    }[] = [];
    const functions: (
      | TSESTree.ArrowFunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
    )[] = [];

    const report = (node: TSESTree.TypeElement) => {
      context.report({
        messageId: "error",
        node,
        suggest: [
          {
            messageId: "suggestion",
            fix: (fixer) => {
              const previousToken = context.sourceCode.getTokenBefore(node, {
                includeComments: true,
              });
              const lastToken = context.sourceCode.getLastToken(node);
              if (!previousToken || !lastToken) return null;
              return fixer.replaceTextRange(
                [previousToken.range[1], lastToken.range[1]],
                "",
              );
            },
          },
        ],
      });
    };

    return {
      "ArrowFunctionExpression"(node) {
        functions.push(node);
      },
      "FunctionDeclaration"(node) {
        functions.push(node);
      },
      "FunctionExpression"(node) {
        functions.push(node);
      },
      "TSTypeAliasDeclaration"(node) {
        if (node.typeAnnotation.type === "TSTypeLiteral") {
          const members = node.typeAnnotation.members;
          if (
            members.every((member) => member.type === "TSPropertySignature")
          ) {
            typeLiteralDefs.push({
              name: node.id.name,
              members,
              usedKeys: null,
            });
          }
        }
      },
      "Program:exit"() {
        for (const node of functions) {
          for (const param of node.params) {
            if (
              param.type === "ObjectPattern" &&
              // Filter destructuring with rest elements
              param.properties.every(
                (property) => property.type === "Property",
              ) &&
              param.typeAnnotation
            ) {
              const ta = param.typeAnnotation.typeAnnotation;
              const withMember = (() => {
                if (ta.type === "TSTypeLiteral") return ta;
                if (ta.type !== "TSTypeReference") return null;
                return typeLiteralDefs.find(
                  (typeDef) =>
                    typeDef.name ===
                    (ta.typeName.type === "Identifier" && ta.typeName.name),
                );
              })();
              if (!withMember) continue;
              if (
                withMember.members.some(
                  (member) => member.type !== "TSPropertySignature",
                )
              ) {
                continue;
              }
              for (const member of withMember.members) {
                if (member.type !== "TSPropertySignature") continue;
                const { key } = member;
                if (key.type !== "Identifier") continue;
                const used = param.properties.some(
                  (property) =>
                    property.key.type === "Identifier" &&
                    property.key.name === key.name,
                );
                if (ta.type === "TSTypeLiteral" && !used) {
                  report(member);
                } else if ("usedKeys" in withMember && used) {
                  withMember.usedKeys ??= new Set();
                  withMember.usedKeys.add(key.name);
                }
              }
            }
          }
        }
        for (const typeDef of typeLiteralDefs) {
          for (const member of typeDef.members) {
            if (
              member.type === "TSPropertySignature" &&
              member.key.type === "Identifier" &&
              typeDef.usedKeys &&
              !typeDef.usedKeys.has(member.key.name)
            ) {
              report(member);
            }
          }
        }
      },
    };
  },
};

export const cases: Cases = {
  valid: [
    {
      name: "All used",
      code: `
export const fn = ({ foo, bar }: { foo: string; bar: string }) => {
  console.log(foo, bar);
};
`,
    },
    {
      name: "With spread",
      code: `
export const spread = ({
  foo,
  ...rest
}: {
  foo: string;
  baz: string;
  qux: boolean;
}) => {
  console.log(foo, rest);
};
`,
    },
    {
      name: "Shared type alias all used",
      code: `
type Props = { foo : string; bar: string; };
export const fn = ({ foo }: Props) => {
  console.log(foo);
};
export const bar = ({ bar }: Props) => {
  console.log(bar);
};
`,
    },
    {
      name: "Exported type not used",
      code: `
type Foo = { foo : string; bar: string; };
export const fn = ({ foo }: { foo: string }) => {
  console.log(foo);
};
`,
    },
  ],
  invalid: [
    {
      name: "Arrow function",
      code: `
export const arrowFunction = ({
  foo,
  bar,
}: {
  foo: string;
  bar: string;
  baz: string;
}) => {
  console.log(foo, bar);
};
`,
      suggestionOutput: `
export const arrowFunction = ({
  foo,
  bar,
}: {
  foo: string;
  bar: string;
}) => {
  console.log(foo, bar);
};
`,
    },
    {
      name: "Function expression",
      code: `
export const functionExpression = function ({
  foo,
  bar,
}: {
  foo: string;
  bar: string;
  baz: string;
}) {
  console.log(foo, bar);
};
`,
      suggestionOutput: `
export const functionExpression = function ({
  foo,
  bar,
}: {
  foo: string;
  bar: string;
}) {
  console.log(foo, bar);
};
`,
    },
    {
      name: "Function expression",
      code: `
export function functionDeclaration({
  foo,
  bar,
}: {
  foo: string;
  bar: string;
  baz: string;
}) {
  console.log(foo, bar);
};
`,
      suggestionOutput: `
export function functionDeclaration({
  foo,
  bar,
}: {
  foo: string;
  bar: string;
}) {
  console.log(foo, bar);
};
`,
    },
    {
      name: "Second argument",
      code: `
export const fn = (
  type: string,
  {
    foo,
    bar,
  }: {
    foo: string;
    bar: string;
    baz: string;
  },
) => {
  console.log(type, foo, bar);
};
`,
      suggestionOutput: `
export const fn = (
  type: string,
  {
    foo,
    bar,
  }: {
    foo: string;
    bar: string;
  },
) => {
  console.log(type, foo, bar);
};
`,
    },
    {
      name: "Type alias",
      code: `
type Props = { foo : string; bar: string; };
export const fn = ({ foo }: Props) => {
  console.log(foo);
};
`,
      suggestionOutput: `
type Props = { foo : string; };
export const fn = ({ foo }: Props) => {
  console.log(foo);
};
`,
    },
    {
      name: "Shared type alias unsued",
      code: `
type Props = { foo : string; bar: string; };
export const fn = ({ foo }: Props) => {
  console.log(foo);
};
export const bar = ({ foo }: Props) => {
  console.log(foo);
};
`,
      suggestionOutput: `
type Props = { foo : string; };
export const fn = ({ foo }: Props) => {
  console.log(foo);
};
export const bar = ({ foo }: Props) => {
  console.log(foo);
};
`,
    },
  ],
};
