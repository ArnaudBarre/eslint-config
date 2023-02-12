import { Cases } from "../types";

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
      fixOutput: `
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
      fixOutput: `
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
      fixOutput: `
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
      fixOutput: `
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
  ],
};
