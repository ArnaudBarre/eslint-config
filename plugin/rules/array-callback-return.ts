import { ESLintUtils, type TSESLint } from "@typescript-eslint/utils";
import { TypeFlags } from "typescript";
import type { Cases } from "../tests/types.ts";

type MessageId = "shouldBeBoolean" | "flatMap" | "addTypeAnnotation";

const methodsRecords: Record<string, MessageId> = {
  every: "shouldBeBoolean",
  some: "shouldBeBoolean",
  filter: "shouldBeBoolean",
  find: "shouldBeBoolean",
  findLast: "shouldBeBoolean",
  findLastIndex: "shouldBeBoolean",
  flatMap: "flatMap",
  map: "addTypeAnnotation",
  reduce: "addTypeAnnotation",
  reduceRight: "addTypeAnnotation",
};
const methods = Object.keys(methodsRecords);

const base =
  "Found undefined in the return type of this callback. It could come from a missing return statement.";

export const rule: TSESLint.RuleModule<MessageId> = {
  meta: {
    type: "problem",
    messages: {
      shouldBeBoolean: base + "Update the code to return a boolean value.",
      flatMap:
        base
        + "If this is intentional, update the code to return an array of a single value.",
      addTypeAnnotation:
        base
        + "If this is intentional, add an explicit type to the function or use a disable comment.",
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const service = ESLintUtils.getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    return {
      MemberExpression(node) {
        if (
          node.property.type === "Identifier"
          && methods.includes(node.property.name)
          && node.parent.type === "CallExpression"
          && node.parent.arguments.length >= 1
        ) {
          const callback = node.parent.arguments[0];
          if (
            callback.type === "ArrowFunctionExpression"
            && callback.expression
          ) {
            return;
          }
          const tsNode = service.esTreeNodeToTSNodeMap.get(callback);
          const functionType = typeChecker.getTypeAtLocation(tsNode);
          const signatures = functionType.getCallSignatures();
          if (signatures.length === 0) return;

          for (const signature of signatures) {
            const type = signature.getReturnType();
            /* eslint-disable no-bitwise */
            if (
              type.flags & TypeFlags.Undefined
              || (type.isUnion()
                && type.types.some((t) => t.flags & TypeFlags.Undefined))
            ) {
              const messageId = methodsRecords[node.property.name];
              if (
                messageId === "addTypeAnnotation"
                && node.parent.typeArguments
              ) {
                return;
              }
              context.report({ node: node.property, messageId });
            }
          }
        }
      },
    };
  },
};

export const cases: Cases<MessageId> = {
  valid: [
    {
      name: "shorthand arrow function",
      code: "[0, 1, undefined].map((x) => x)",
    },
    {
      name: "every returns boolean",
      code: "[0, 1, 2].every((x) => { return x > 0 })",
    },
    {
      name: "flatMap with [undefined]",
      code: "[0, 1, 2, undefined].flatMap((x) => { return typeof x === 'number' ? x : [x] })",
    },
    {
      name: "map with type annotation",
      code: "[0, 1, 2, undefined].map<number | undefined>((x) => { return x })",
    },
  ],
  invalid: [
    {
      name: "missing return",
      errorId: "addTypeAnnotation",
      code: `[0, 1, 2].map((x) => { 
  switch (x) {
    case 0:
      return 'zero';
    case 1:
      return 'one';
  }
})
      `,
    },
    {
      name: "returns undefined",
      errorId: "shouldBeBoolean",
      code: "[0, 1, 2, undefined].some((x) => { return x })",
    },
    {
      name: "flatMap returns undefined",
      errorId: "flatMap",
      code: "[{ a: [1] }, { a: [2] }, { a: undefined }].flatMap((x) => { return x.a })",
    },
  ],
};
