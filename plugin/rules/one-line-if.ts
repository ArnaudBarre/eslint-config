import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error: "When possible, keep if condition on one line",
    },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    IfStatement(node) {
      if (canBeOneLine(node)) {
        const parentBlock =
          node.parent.type === "BlockStatement"
          || node.parent.type === "Program"
            ? node.parent.body
            : node.parent.type === "SwitchCase"
              ? node.parent.consequent
              : undefined;
        if (parentBlock) {
          const currentIfIndex = parentBlock.indexOf(node);
          const previousStatement = parentBlock[currentIfIndex - 1];
          const nextStatement = parentBlock.at(currentIfIndex + 1);
          if (
            [previousStatement, nextStatement].some(
              (s) =>
                s?.type === "IfStatement"
                && s.loc.start.line !== s.loc.end.line
                && !canBeOneLine(s),
            )
          ) {
            return;
          }
        }
        const body = node.consequent.body[0];
        context.report({
          node,
          messageId: "error",
          fix: (fixer) => [
            fixer.removeRange([node.consequent.range[0], body.range[0]]),
            fixer.removeRange([body.range[1], node.consequent.range[1]]),
          ],
        });
      }
    },
  }),
};

const canBeOneLine = (
  node: TSESTree.IfStatement,
): node is TSESTree.IfStatement & { consequent: TSESTree.BlockStatement } =>
  node.alternate === null
  && node.parent.type !== "IfStatement" // not else-if
  && node.test.loc.start.line === node.test.loc.end.line
  && node.consequent.loc.end.line === node.test.loc.start.line + 2
  && node.consequent.type === "BlockStatement"
  && node.consequent.body.length > 0 // Empty body handled by no-empty
  && node.test.loc.end.column + getLength(node.consequent.body[0].range) < 79;

const getLength = ([start, end]: [number, number]) => end - start;

export const cases: Cases = {
  valid: [
    {
      name: "80 chars line",
      code: '  if (value === 0) return "Lorem ipsum dolor sit amet, consectetur adipisicing";',
    },
    {
      name: "Splitted 81 chars line",
      code: `  if (value === 0) {
    return "Lorem ipsum dolor sit amet, consectetur adipisicing ";
  }`,
    },
    {
      name: "if/else",
      code: `  if (value === 0) {
    console.log("Lorem ipsum dolor sit amet");
  } else {
    console.log("Lorem ipsum dolor sit");
  }`,
    },
    {
      name: "Multiline if condition",
      code: `if (
    // Some comment
    value === 0
  ) {
    return 3;
  }`,
    },
    {
      name: "Empty statement",
      code: `if (value === 0) {
    
  }`,
    },
    {
      name: "Consistent layout, parent is program",
      code: `  if (value === 0) {
    return "Lorem ipsum dolor sit amet, consectetur adipisicing ";
  }
  if (value === 1) {
    return "Shorter but consistent layout";
  }`,
    },
    {
      name: "Consistent layout, parent is switch",
      code: `switch(value) {
  case 0:
    if (value === 0) {
      return "Lorem ipsum dolor sit amet, consectetur adipisicing ";
    }
    if (value === 1) {
      return "Shorter but consistent layout";
    }
}`,
    },
  ],
  invalid: [
    {
      name: "Splitted 80 chars line",
      code: `  if (value === 0) {
    return "Lorem ipsum dolor sit amet, consectetur adipisicing";
  }`,
      fixOutput:
        '  if (value === 0) return "Lorem ipsum dolor sit amet, consectetur adipisicing";',
    },
    {
      name: "Non consistent one-line layout",
      code: `  if (value === 0) return "0";
  if (value === 1) {
    return "1";
  }`,
      fixOutput: `  if (value === 0) return "0";
  if (value === 1) return "1";`,
    },
    {
      name: "Both if can be one-line",
      errorId: ["error", "error"],
      code: `  if (value === 0) {
    return "0";
  }
  if (value === 1) {
    return "1";
  }`,
      fixOutput: `  if (value === 0) return "0";
  if (value === 1) return "1";`,
    },
  ],
};
