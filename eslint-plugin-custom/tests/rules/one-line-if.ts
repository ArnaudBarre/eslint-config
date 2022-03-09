import { Cases } from "../types";

export const cases: Cases = {
  valid: [
    {
      name: "80 chars line",
      code: `  if (value === 0) return "Lorem ipsum dolor sit amet, consectetur adipisicing";`,
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
  ],
  invalid: [
    {
      name: "Splitted 80 chars line",
      code: `  if (value === 0) {
    return "Lorem ipsum dolor sit amet, consectetur adipisicing";
  }`,
      fixOutput: `  if (value === 0) return "Lorem ipsum dolor sit amet, consectetur adipisicing";`,
    },
  ],
};
