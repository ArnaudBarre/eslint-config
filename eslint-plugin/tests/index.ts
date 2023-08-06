import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RuleTester } from "@typescript-eslint/rule-tester";
import type { Cases } from "./types.ts";

RuleTester.afterAll = () => undefined;
RuleTester.describe = (_, cb) => cb();
RuleTester.it = (_, cb) => cb();
const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
  },
});

const toAbsolute = (fileName: string) =>
  join(dirname(fileURLToPath(import.meta.url)), fileName);

let failedTests = 0;
const it = (
  ruleName: string,
  name: string,
  rule: any,
  cases: Parameters<typeof ruleTester.run>[2],
) => {
  try {
    ruleTester.run(ruleName, rule, cases);
    console.log(`  ${name} ✅`);
  } catch (e) {
    console.log(`  ${name} ❌`);
    console.error(e);
    failedTests++;
  }
};

const testCase = process.argv.at(2);

for (const filePath of readdirSync("rules")) {
  const ruleName = filePath.slice(0, -3);
  if (testCase && ruleName !== testCase) continue;
  console.log(`${ruleName}:`);
  const { rule, cases } = (await import(`../rules/${filePath}`)) as {
    rule: any;
    cases: Cases;
  };

  for (const { name, code, fileName } of cases.valid) {
    it(ruleName, name, rule, {
      valid: [{ code, filename: toAbsolute(fileName ?? "mock.tsx") }],
      invalid: [],
    });
  }

  for (const {
    name,
    code,
    errorId,
    fixOutput,
    suggestionOutput,
  } of cases.invalid) {
    it(ruleName, name, rule, {
      valid: [],
      invalid: [
        {
          code,
          filename: toAbsolute("mock.tsx"),
          errors: [
            {
              messageId: errorId ?? "error",
              suggestions: suggestionOutput
                ? [{ messageId: "suggestion", output: suggestionOutput }]
                : [],
            },
          ],
          output: fixOutput ?? null,
        },
      ],
    });
  }
}

if (failedTests) {
  console.log(`${failedTests} tests failed`);
  process.exit(1);
}
