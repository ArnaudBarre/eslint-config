import { ESLintUtils } from "@typescript-eslint/utils";
import { rules } from "..";
import { Cases } from "./types";

// @ts-ignore https://github.com/typescript-eslint/typescript-eslint/pull/4656
globalThis.afterAll = () => {};

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaFeatures: { jsx: true },
  },
});

let failedTests = 0;

Object.entries(rules).forEach(([ruleName, rule]) => {
  console.log(`${ruleName}:`);
  const it = (name: string, cases: Parameters<typeof ruleTester.run>[2]) => {
    try {
      ruleTester.run(ruleName, rule, cases);
      console.log(`  ${name} ✅`);
    } catch (e) {
      console.log(`  ${name} ❌`);
      console.error(e);
      failedTests++;
    }
  };

  const { valid, invalid } = require(`./rules/${ruleName}`).cases as Cases;

  valid.forEach(({ name, code }) => {
    it(name, { valid: [{ code }], invalid: [] });
  });

  invalid.forEach(({ name, code, errorId, fixOutput }) => {
    it(name, {
      valid: [],
      invalid: [
        {
          code,
          errors: [{ messageId: errorId ?? "error" }],
          output: fixOutput ?? code,
        },
      ],
    });
  });
});

if (failedTests) {
  console.log(`${failedTests} tests failed`);
  process.exit(1);
}
