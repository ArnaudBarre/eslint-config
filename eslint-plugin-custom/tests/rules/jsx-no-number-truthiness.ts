import { Cases } from "../types";

export const cases: Cases = {
  valid: [
    {
      name: "Boolean",
      code: "const loading: boolean; <>{loading && 'Ok'}</>",
    },
    {
      name: "Nullable boolean",
      code: "const loading: boolean | undefined; <>{loading && 'Ok'}</>",
    },
    {
      name: "> 0",
      code: "const list: string[]; <>{list.length > 0 && 'Ok'}</>",
    },
  ],
  invalid: [
    {
      name: ".length",
      code: "const list: string[]; <>{list.length && 'Not ok'}</>",
    },
    {
      name: "number",
      code: "const num: number; <>{num && 'Not ok'}</>",
    },
  ],
};
