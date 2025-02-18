import {
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

const reactComponentNameRE = /^[A-Z][a-zA-Z0-9]*$/u;

export const rule: TSESLint.RuleModule<
  "missingKey" | "keyFirst" | "keySpread" | "keyInProps"
> = {
  meta: {
    messages: {
      missingKey: "Missing key",
      keyFirst: "Key should be first",
      keySpread: "Key should not be spread",
      keyInProps: '"key" can\'t be part of props',
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const service = ESLintUtils.getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    const reportFragment = (node: TSESTree.JSXFragment) => {
      context.report({ messageId: "missingKey", node: node.openingFragment });
    };
    const checkElement = (node: TSESTree.JSXElement) => {
      let keyAttr: { index: number; node: TSESTree.JSXAttribute } | undefined;
      for (const [index, attr] of node.openingElement.attributes.entries()) {
        if (
          attr.type === "JSXAttribute" &&
          attr.name.type === "JSXIdentifier" &&
          attr.name.name === "key"
        ) {
          keyAttr = { index, node: attr };
        }
        if (attr.type === "JSXSpreadAttribute") {
          const tsNode = service.esTreeNodeToTSNodeMap.get(attr.argument);
          const type = typeChecker.getTypeAtLocation(tsNode);
          if (type.getProperty("key")) {
            context.report({ messageId: "keySpread", node: attr });
          }
        }
      }
      if (keyAttr) {
        if (keyAttr.index !== 0) {
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

    const checkIfReactComponentWithKeyInProps = (
      id: TSESTree.Identifier,
      fnNode: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression,
    ) => {
      if (!reactComponentNameRE.test(id.name)) return;
      if (fnNode.params.length === 0) return;
      const tsNode = service.esTreeNodeToTSNodeMap.get(fnNode.params[0]);
      const type = typeChecker.getTypeAtLocation(tsNode);
      if (type.getProperty("key")) {
        context.report({ messageId: "keyInProps", node: id });
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
      VariableDeclaration(node) {
        if (node.declarations.length !== 1) return;
        if (node.declarations[0].init?.type !== "ArrowFunctionExpression") {
          return;
        }
        if (node.declarations[0].id.type !== "Identifier") return;
        checkIfReactComponentWithKeyInProps(
          node.declarations[0].id,
          node.declarations[0].init,
        );
      },
      FunctionDeclaration(node) {
        if (!node.id) return;
        checkIfReactComponentWithKeyInProps(node.id, node);
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
      name: "Map with key and spread",
      code: "[{ id: 1 }].map(el => <Bar key={el.id} {...el} />)",
    },
    {
      name: "Map with key and spread with destructuring",
      code: "[{ key: 1, foo: 2 }].map(({ key, ...rest }) => <Bar key={key} {...rest} />)",
    },
    {
      name: "Function expression with key in props",
      code: `export const Foo = ({ foo }: Omit<{ key: string; foo: number }, "key">) => (
        <Bar key={foo} foo={foo} />
      )`,
    },
    {
      name: "Function declaration with key omitted in props",
      code: `export function Foo({ foo }: Omit<{ key: string; foo: number }, "key">) {
        return <Bar key={foo} foo={foo} />
      }`,
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
      name: "Map with spread without destructuring",
      code: "[{ key: 1, foo: 2 }].map(el => <Bar {...el} />)",
      errorId: ["missingKey", "keySpread"],
    },
    {
      name: "Key in React prop type",
      code: `export const Foo = ({ key, foo }: { key: string; foo: number }) => (
        <Bar key={key} foo={foo} />
      )`,
      errorId: "keyInProps",
    },
    {
      name: "Key in React prop type function declaration",
      code: `export function Foo({ key, foo }: { key: string; foo: number }) {
        return <Bar key={key} foo={foo} />
      }`,
      errorId: "keyInProps",
    },
  ],
};
