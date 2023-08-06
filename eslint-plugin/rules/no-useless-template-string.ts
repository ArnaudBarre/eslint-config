import { TSESLint } from "@typescript-eslint/utils";
import { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: {
      error: 'Prefer "" for string without interpolation',
    },
    type: "layout",
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TemplateLiteral(node) {
      if (node.parent.type === "TaggedTemplateExpression") return;
      if (node.quasis.length > 1) return;
      const value = node.quasis[0].value.raw;
      if (value.includes("'") && value.includes('"')) return;
      if (node.loc.start.line !== node.loc.end.line) return;
      const replacer = value.includes('"') ? "'" : '"';
      context.report({
        messageId: "error",
        node,
        fix: (fixer) => [
          fixer.replaceTextRange([node.range[0], node.range[0] + 1], replacer),
          fixer.replaceTextRange([node.range[1] - 1, node.range[1]], replacer),
        ],
      });
    },
  }),
};

export const cases: Cases = {
  valid: [
    {
      name: "Template with interpolation",
      // eslint-disable-next-line no-template-curly-in-string
      code: "`Some template ${3 + 3}`",
    },
    {
      name: "Template with interpolation only",
      // eslint-disable-next-line no-template-curly-in-string
      code: "`${3 + 3}`",
    },
    {
      name: `Template with both " & '`,
      code: "`Some 'weird \"quoting\"'`",
    },
    {
      name: "Multilines template",
      code: `\`Some template
  on two lines\``,
    },
    {
      name: "Tagged template",
      code: 'prisma.queryRaw`SELECT * FROM "User"`',
    },
  ],
  invalid: [
    {
      name: "Template without interpolation",
      code: "`Some template`",
      fixOutput: '"Some template"',
    },
    {
      name: 'Template with " & without interpolation',
      code: '`Some "template"`',
      fixOutput: `'Some "template"'`,
    },
  ],
};
