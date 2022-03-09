import { Cases } from "../types";

export const cases: Cases = {
  valid: [
    {
      name: "Template outside of jsx",
      code: "const template = `Some template ${3 + 3}`; return <>{template}</>",
    },
    {
      name: "Spaces start",
      code: "return <>{` Ok with space ${3 + 3}`}</>",
    },
    {
      name: "Spaces end",
      code: "return <>{`Ok with space ${3 + 3} at end `}</>",
    },
    {
      name: "Function call",
      code: "return <>{`Ok ${3 + 3}`.slice(1)}</>",
    },
    {
      name: "JSX attribute",
      code: "return <button className={`flex ${loading ? 'spin' : ''}`} />",
    },
  ],
  invalid: [
    {
      name: "Interpolation start",
      code: "return <>{`${3} not ok`}</>",
    },
    {
      name: "Interpolation end",
      code: "return <>{`Not ok ${3 + 3}`}</>",
    },
    {
      name: "Interpolation only",
      code: "return <>{`${3}`}</>",
    },
  ],
};
