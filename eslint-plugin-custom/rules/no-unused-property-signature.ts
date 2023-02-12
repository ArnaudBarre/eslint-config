// Credit: @greg2451
// Most cases are already covered by react/no-unused-prop-types, but this rule
// also check for non React functions and add fix via suggestion
import { TSESLint, TSESTree } from "@typescript-eslint/utils";

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
  create: (context) => ({
    ArrowFunctionExpression: (node) =>
      checkForUnusedPropertySignatures(context, node),
    FunctionDeclaration: (node) =>
      checkForUnusedPropertySignatures(context, node),
    FunctionExpression: (node) =>
      checkForUnusedPropertySignatures(context, node),
  }),
};

const checkForUnusedPropertySignatures = (
  context: Readonly<TSESLint.RuleContext<"error" | "suggestion", []>>,
  node:
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression,
) => {
  node.params.forEach((param) => {
    if (
      param.type === "ObjectPattern" &&
      // Filter destructuring with rest elements
      param.properties.every((property) => property.type === "Property") &&
      param.typeAnnotation &&
      param.typeAnnotation.typeAnnotation.type === "TSTypeLiteral" &&
      param.typeAnnotation.typeAnnotation.members.every(
        (member) => member.type === "TSPropertySignature",
      ) &&
      param.typeAnnotation.typeAnnotation.members.length >
        param.properties.length
    ) {
      param.typeAnnotation.typeAnnotation.members.forEach((member) => {
        if (
          !param.properties.some(
            (property) =>
              property.type === "Property" &&
              member.type === "TSPropertySignature" &&
              property.key.type === "Identifier" &&
              member.key.type === "Identifier" &&
              property.key.name === member.key.name,
          )
        ) {
          context.report({
            messageId: "error",
            loc: member.loc,
            fix: (fixer) => {
              const previousToken = context
                .getSourceCode()
                .getTokenBefore(member, { includeComments: true });
              const lastToken = context.getSourceCode().getLastToken(member);
              if (previousToken && lastToken) {
                return fixer.replaceTextRange(
                  [previousToken.range[1], lastToken.range[1]],
                  "",
                );
              }
              return null;
            },
          });
        }
      });
    }
  });
};
