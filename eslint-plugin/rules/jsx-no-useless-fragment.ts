import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error" | "suggestion"> = {
  meta: {
    messages: { error: "Useless fragment", suggestion: "Remove fragment" },
    type: "layout",
    hasSuggestions: true,
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const checkNode = (node: TSESTree.JSXFragment | TSESTree.JSXElement) => {
      const nonPaddingChildren = node.children.filter(
        (child) =>
          !(
            child.type === "JSXText" &&
            isOnlyWhitespace(child.raw) &&
            child.raw.includes("\n")
          ),
      );

      if (
        nonPaddingChildren.length < 2 &&
        // Exclude this valid use '<Foo content={<>bar</>} />'
        // Could be replaced by string prop but plays better nice with Prettier for long lines
        !(
          node.children.length === 1 &&
          node.children[0].type === "JSXText" &&
          !(
            node.parent.type === "JSXElement" ||
            node.parent.type === "JSXFragment"
          )
        )
      ) {
        context.report({
          messageId: "error",
          node,
          suggest: getFix(node, nonPaddingChildren),
        });
        return;
      }

      if (
        node.parent.type === "JSXElement" &&
        node.parent.openingElement.name.type === "JSXIdentifier" &&
        domElementRE.test(node.parent.openingElement.name.name)
      ) {
        context.report({
          messageId: "error",
          node,
          suggest: getFix(node, nonPaddingChildren),
        });
      }
    };

    const getFix = (
      node: TSESTree.JSXFragment | TSESTree.JSXElement,
      nonPaddingChildren: TSESTree.JSXChild[],
    ) => {
      const outsideJSX =
        node.parent.type !== "JSXElement" && node.parent.type !== "JSXFragment";
      if (outsideJSX && node.children.length === 0) {
        // const a = <></>
        return null;
      }

      const fix = (fixer: TSESLint.RuleFixer) => {
        const opener =
          node.type === "JSXFragment"
            ? node.openingFragment
            : node.openingElement;
        const closer =
          node.type === "JSXFragment"
            ? node.closingFragment
            : node.closingElement;

        if (!closer) return fixer.remove(node);

        const child = nonPaddingChildren.at(0);
        if (
          outsideJSX &&
          (child?.type === "JSXExpressionContainer" ||
            child?.type === "JSXSpreadChild")
        ) {
          return [
            fixer.removeRange([opener.range[0], child.expression.range[0]]),
            fixer.removeRange([child.expression.range[1], closer.range[1]]),
          ];
        }

        const childrenText = context
          .getSourceCode()
          .getText()
          .slice(opener.range[1], closer.range[0]);

        return fixer.replaceText(node, trimLikeReact(childrenText));
      };

      return [{ messageId: "suggestion" as const, fix }];
    };

    return {
      JSXElement(node) {
        if (
          node.openingElement.name.type === "JSXIdentifier" &&
          node.openingElement.name.name === "Fragment" &&
          !node.openingElement.attributes.length
        ) {
          checkNode(node);
        }
      },
      JSXFragment: checkNode,
    };
  },
};

const isOnlyWhitespace = (text: string) => text.trim().length === 0;

const domElementRE = /^[a-z]+$/u;
const leadingSpacesRE = /^\s*/u;
const trailingSpacesRE = /\s*$/u;
const trimLikeReact = (text: string) => {
  const leadingSpaces = leadingSpacesRE.exec(text)?.[0];
  const trailingSpaces = trailingSpacesRE.exec(text)?.[0];

  const start = leadingSpaces?.includes("\n") ? leadingSpaces.length : 0;
  const end = trailingSpaces?.includes("\n")
    ? text.length - trailingSpaces.length
    : text.length;

  return text.slice(start, end);
};

export const cases: Cases = {
  valid: [
    {
      name: "Two components",
      code: "<><Foo /><Bar /></>",
    },
    {
      name: "Text + dom el",
      code: "<>foo<div /></>",
    },
    {
      name: "Space + dom el",
      code: "<> <div /></>",
    },
    {
      name: "JSXContainer + space",
      code: '<>{"moo"} </>',
    },
    {
      name: "Text child outside of JSXElement",
      code: "<Foo content={<>bar</>} />",
    },
  ],
  invalid: [
    {
      name: "Dom's child",
      code: "<p>moo<>foo</></p>",
      suggestionOutput: "<p>moofoo</p>",
    },
    {
      name: "JSX child",
      code: "<><div /></>",
      suggestionOutput: "<div />",
    },
    {
      name: "whitespace tricky",
      code: `
        <section>
          git<>
            <b>hub</b>.
          </>

          git
        </section>`,
      suggestionOutput: `
        <section>
          git<b>hub</b>.

          git
        </section>`,
    },
    {
      name: "Empty fragment outside JSX",
      code: "const a = <></>",
    },
    {
      name: "Empty fragment inside JSX",
      code: "const a = <div><></></div>",
      suggestionOutput: "const a = <div></div>",
    },
    {
      name: "JSXExpressionContainer child inside JSX",
      code: "return <Foo><>{array.map(foo => <Bar key={foo.id} foo={foo} />)}</></Foo>",
      suggestionOutput:
        "return <Foo>{array.map(foo => <Bar key={foo.id} foo={foo} />)}</Foo>",
    },
    {
      name: "Expression inside JSX",
      code: `
<Foo>
  {bool && (
    <>
      {array.map((foo) => (
        <Bar key={foo.id} foo={foo} />
      ))}
    </>
  )}
</Foo>`,
      suggestionOutput: `
<Foo>
  {bool && (
    array.map((foo) => (
        <Bar key={foo.id} foo={foo} />
      ))
  )}
</Foo>`,
    },
    {
      name: "JSXExpressionContainer child outside JSX",
      code: "return <>{array.map(foo => <Bar key={foo.id} foo={foo} />)}</>",
      suggestionOutput:
        "return array.map(foo => <Bar key={foo.id} foo={foo} />)",
    },
    {
      name: "JSXSpread child outside JSX",
      code: "return <>{...elements}</>",
      suggestionOutput: "return elements",
    },
  ],
};
