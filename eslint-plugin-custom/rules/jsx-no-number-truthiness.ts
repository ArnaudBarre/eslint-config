// Inspired from https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/rules/restrict-template-expressions.ts
import { ESLintUtils, TSESLint } from "@typescript-eslint/utils";
import { Type } from "typescript";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error:
        "Don't use logical expression on a number inside JSX, you might render the character 0 instead of rendering nothing. Either use a ternary expression or more explicit condition",
    },
    type: "problem",
    schema: [],
  },
  create: (context) => {
    const service = ESLintUtils.getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    const isNumber = (type: Type) => {
      const stringType = typeChecker.typeToString(type);
      if (
        stringType === "0" ||
        stringType === "number" ||
        stringType === "bigint"
      ) {
        return true;
      }
      if (type.isUnion()) return type.types.some(isNumber);
      return false;
    };

    return {
      LogicalExpression: (node) => {
        if (node.operator !== "&&") return;
        if (node.parent?.type !== "JSXExpressionContainer") return;
        const tsNode = service.esTreeNodeToTSNodeMap.get(node.left);
        const type = typeChecker.getTypeAtLocation(tsNode);
        if (isNumber(type)) context.report({ node, messageId: "error" });
      },
    };
  },
};
