import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"missingKey" | "keyFirst"> = {
  meta: {
    messages: {
      missingKey: "Missing key",
      keyFirst: "Key should be first or just after a spread",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const reportFragment = (node: TSESTree.JSXFragment) => {
      context.report({ messageId: "missingKey", node: node.openingFragment });
    };
    const checkElement = (node: TSESTree.JSXElement) => {
      let keyAttr: { index: number; node: TSESTree.JSXAttribute } | undefined;
      let spreadIndex: number | undefined;
      for (const [index, attr] of node.openingElement.attributes.entries()) {
        if (attr.type === "JSXAttribute") {
          if (attr.name.type === "JSXIdentifier" && attr.name.name === "key") {
            keyAttr = { index, node: attr };
          }
        } else if (!keyAttr) {
          spreadIndex = index;
        }
      }
      if (keyAttr) {
        if (
          spreadIndex === undefined || spreadIndex > keyAttr.index
            ? keyAttr.index !== 0
            : keyAttr.index !== spreadIndex + 1
        ) {
          context.report({ messageId: "keyFirst", node: keyAttr.node });
        }
      } else {
        context.report({ messageId: "missingKey", node: node.openingElement });
      }
    };
    const checkExpression = (node: TSESTree.Expression) => {
      switch (node.type) {
        case "JSXElement":
          checkElement(node);
          break;
        case "JSXFragment":
          reportFragment(node);
          break;
        case "ConditionalExpression":
          checkExpression(node.consequent);
          checkExpression(node.alternate);
          break;
        case "LogicalExpression":
          checkExpression(node.left);
          checkExpression(node.right);
          break;
        default:
          break;
      }
    };
    const checkStatement = (node: TSESTree.Statement) => {
      switch (node.type) {
        case "BlockStatement":
          for (const statement of node.body) checkStatement(statement);
          break;
        case "ReturnStatement":
          if (node.argument) checkExpression(node.argument);
          break;
        case "ExpressionStatement":
          checkExpression(node.expression);
          break;
        case "IfStatement":
          checkStatement(node.consequent);
          if (node.alternate) checkStatement(node.alternate);
          break;
        case "SwitchStatement":
          for (const caseClause of node.cases) {
            for (const statement of caseClause.consequent) {
              checkStatement(statement);
            }
          }
          break;
        default:
          break;
      }
    };

    return {
      JSXElement(node) {
        if (node.parent.type === "ArrayExpression") checkElement(node);
      },
      JSXFragment(node) {
        if (node.parent.type === "ArrayExpression") reportFragment(node);
      },
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          (node.callee.property.name === "map" ||
            node.callee.property.name === "mapNotNull")
        ) {
          const firstArg = node.arguments.at(0);
          if (firstArg?.type !== "ArrowFunctionExpression") return;

          if (firstArg.body.type === "BlockStatement") {
            checkStatement(firstArg.body);
          } else {
            checkExpression(firstArg.body);
          }
        }
      },
    };
  },
};

export const cases: Cases = {
  valid: [
    {
      name: "Map with key",
      code: "bar.map(el => <Bar key={el.id} baz={2} />)",
    },
    {
      name: "Map with key after spread",
      code: "bar.map(el => <Bar foo={4} {...el} bar={2} {...parent} key={el.id} baz={2} {...rest} />)",
    },
  ],
  invalid: [
    {
      name: "Missing key in map",
      code: "bar.map(el => <Bar id={el.id} />)",
      errorId: "missingKey",
    },
    {
      name: "Missing key in mapNotNull",
      code: "bar.mapNotNull(el => el ? <Bar id={el.id} /> : null)",
      errorId: "missingKey",
    },
    {
      name: "Missing key in switch",
      code: `bar.mapNotNull(el => {
        switch (el.type) {
          case "BAZ": {
            if (el.foo !== 0) return <Bar id={el.id} />
          }
        }
      })`,
      errorId: "missingKey",
    },
    {
      name: "Missing key in logical statement",
      code: `bar.mapNotNull(el => {
        if (el.foo === 0) return null
        else return el.content ?? <Bar id={el.id} /> 
      })`,
      errorId: "missingKey",
    },
    {
      name: "Using fragment",
      code: "bar.map(el => <><Bar key={el.id} /></>)",
      errorId: "missingKey",
    },
    {
      name: "Key not first",
      code: "bar.map(el => <Bar baz={2} key={el.id}  />)",
      errorId: "keyFirst",
    },
    {
      name: "Key not first after spread",
      code: "bar.map(el => <Bar {...el} baz={2} key={el.id} />)",
      errorId: "keyFirst",
    },
  ],
};
