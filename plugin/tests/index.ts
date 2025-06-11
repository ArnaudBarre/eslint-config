import { readdirSync } from "node:fs";
import { RuleTester } from "@typescript-eslint/rule-tester";
import globals from "globals";
import type { Cases } from "./types.ts";

RuleTester.afterAll = () => undefined;
RuleTester.describe = (_, cb) => cb();
RuleTester.it = (_, cb) => cb();
const ruleTester = new RuleTester({
  languageOptions: {
    globals: { ...globals.node, ...globals.browser },
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

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

for (const filePath of readdirSync("plugin/rules")) {
  const ruleName = filePath.slice(0, -3);
  if (testCase && ruleName !== testCase) continue;
  console.log(`${ruleName}:`);
  const { rule, cases } = (await import(`../rules/${filePath}`)) as {
    rule: any;
    cases: Cases;
  };

  for (const { name, code, fileName } of cases.valid) {
    it(ruleName, name, rule, {
      valid: [{ code, filename: fileName ?? "mock.tsx" }],
      invalid: [],
    });
  }

  for (const {
    name,
    code,
    fileName,
    errorId,
    fixOutput,
    suggestionOutput,
  } of cases.invalid) {
    const suggestions = suggestionOutput
      ? [{ messageId: "suggestion", output: suggestionOutput }]
      : [];
    it(ruleName, name, rule, {
      valid: [],
      invalid: [
        {
          code,
          filename: fileName ?? "mock.tsx",
          errors: Array.isArray(errorId)
            ? errorId.map((id) => ({ messageId: id, suggestions }))
            : [{ messageId: errorId ?? "error", suggestions }],
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
