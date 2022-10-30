import { Cases } from "../types";

export const cases: Cases = {
  valid: [
    {
      name: "Template with interpolation",
      code: "`Some template ${3 + 3}`",
    },
    {
      name: "Template with interpolation only",
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
