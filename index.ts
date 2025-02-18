import { join } from "node:path";
// @ts-expect-error
import restrictedGlobals from "confusing-browser-globals";
// @ts-expect-error
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";
import { rules } from "./plugin/index.ts";

/*
 The goal is to fill in the gap between a strict TS & prettier without overlap
 The rules are adapted for class-less React TS codebase
 Inspired by https://github.com/facebook/create-react-app/tree/master/packages/eslint-config-react-app
*/

// eslint-disable-next-line @arnaud-barre/no-default-export
export default tseslint.config(
  { ignores: ["**/dist", "**/*.js"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      unicorn,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@arnaud-barre": { rules },
    },
    languageOptions: {
      parser: tseslint.parser,
      globals: { ...globals.node, ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: join(import.meta.dirname, "../../.."),
      },
    },
    rules: {
      "for-direction": "warn",
      "no-async-promise-executor": "warn",
      "no-compare-neg-zero": "warn",
      "no-cond-assign": "warn",
      "no-control-regex": "warn",
      "no-debugger": "warn",
      "no-dupe-else-if": "warn",
      "no-duplicate-case": "warn",
      "no-empty": "warn",
      "no-empty-character-class": "warn",
      "no-ex-assign": "warn",
      "no-extra-boolean-cast": "warn",
      "no-invalid-regexp": "warn",
      "no-irregular-whitespace": "warn",
      "no-misleading-character-class": "warn",
      "no-regex-spaces": "warn",
      "no-sparse-arrays": "warn",
      "no-template-curly-in-string": "warn",
      "no-unreachable": "warn",
      "no-unsafe-finally": "warn",
      "require-atomic-updates": "warn",
      "use-isnan": "warn",
      "curly": ["warn", "multi-line", "consistent"],
      "eqeqeq": "warn",
      "no-alert": "warn",
      "no-caller": "warn",
      "no-empty-pattern": "warn",
      "no-eval": "warn",
      "no-global-assign": "warn",
      "no-iterator": "warn",
      "no-labels": "warn",
      "no-lone-blocks": "warn",
      "no-loss-of-precision": "warn",
      "no-multi-str": "warn",
      "no-new": "warn",
      "no-new-func": "warn",
      "no-new-wrappers": "warn",
      "no-octal-escape": "warn",
      "no-param-reassign": "warn",
      "no-return-assign": "warn",
      "no-script-url": "warn",
      "no-self-assign": "warn",
      "no-self-compare": "warn",
      "no-useless-call": "warn",
      "no-useless-catch": "warn",
      "no-useless-concat": "warn",
      "no-useless-escape": "warn",
      "no-useless-return": "warn",
      "prefer-regex-literals": "warn",
      "require-unicode-regexp": "warn",
      "wrap-iife": "warn",
      "yoda": "warn",
      "one-var": ["warn", "never"],
      "no-delete-var": "warn",
      /*
        Blacklist browser globals that we deem potentially confusing (e.g. `name` or `status`).
        This is dangerous as it hides accidentally undefined variables.
        To use them, explicitly reference them, e.g. `window.name` or `window.status`.
      */
      "no-restricted-globals": ["error", ...restrictedGlobals],
      "func-style": "warn",
      "no-bitwise": "warn",
      "no-mixed-operators": [
        "warn",
        {
          groups: [
            ["===", "!==", ">", ">=", "<", "<="],
            ["&&", "||"],
          ],
        },
      ],
      "no-multi-assign": "warn",
      "no-object-constructor": "warn",
      "no-restricted-syntax": [
        "warn",
        "WithStatement",
        "SequenceExpression",
        {
          selector: "TSEnumDeclaration",
          message: "Use union of strings instead",
        },
      ],
      "no-unneeded-ternary": "warn",
      "prefer-exponentiation-operator": "warn",
      "prefer-object-spread": "warn",
      "spaced-comment": ["warn", "always", { markers: ["/"] }],
      "unicode-bom": "warn",
      "arrow-body-style": "warn",
      "no-new-native-nonconstructor": "warn",
      "no-useless-computed-key": "warn",
      "no-useless-rename": "warn",
      "no-var": "warn",
      "object-shorthand": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-const": "warn",
      "prefer-rest-params": "warn",
      "prefer-spread": "warn",
      "require-yield": "warn",

      "@typescript-eslint/class-methods-use-this": "warn",
      "@typescript-eslint/default-param-last": "warn",
      "@typescript-eslint/dot-notation": "warn",
      "@typescript-eslint/no-array-constructor": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-implied-eval": "warn",
      "@typescript-eslint/no-loop-func": "warn",
      "@typescript-eslint/no-redeclare": "warn",
      "@typescript-eslint/no-shadow": "warn", // TODO: ideally builtinGlobals should be enabled but too many browser globals are enabled somehow
      "@typescript-eslint/no-unsafe-unary-minus": "warn",
      "@typescript-eslint/no-unused-expressions": [
        "warn",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-useless-constructor": "warn",
      "@typescript-eslint/only-throw-error": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/return-await": ["warn", "always"],
      "@typescript-eslint/adjacent-overload-signatures": "warn",
      "@typescript-eslint/array-type": "warn",
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/consistent-generic-constructors": "warn",
      "@typescript-eslint/consistent-type-assertions": "warn",
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/method-signature-style": "warn",
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "variableLike",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          filter: { regex: "^__", match: false },
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      "@typescript-eslint/no-array-delete": "warn",
      "@typescript-eslint/no-confusing-void-expression": [
        "warn",
        { ignoreArrowShorthand: true },
      ],
      "@typescript-eslint/no-dynamic-delete": "warn",
      "@typescript-eslint/no-extra-non-null-assertion": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-for-in-array": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-meaningless-void-operator": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
      "@typescript-eslint/no-misused-promises": [
        "warn",
        {
          checksConditionals: false,
          checksVoidReturn: { arguments: false, attributes: false },
        },
      ],
      "@typescript-eslint/no-misused-spread": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unnecessary-condition": [
        "warn",
        {
          allowConstantLoopConditions: "only-allowed-literals",
          checkTypePredicates: true,
        },
      ],
      "@typescript-eslint/no-unnecessary-template-expression": "warn",
      "@typescript-eslint/no-unnecessary-type-arguments": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/no-useless-empty-export": "warn",
      "@typescript-eslint/non-nullable-type-assertion-style": "warn",
      "@typescript-eslint/prefer-as-const": "warn",
      "@typescript-eslint/prefer-find": "warn",
      "@typescript-eslint/prefer-includes": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": [
        "warn",
        { ignoreConditionalTests: false },
      ],
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/prefer-promise-reject-errors": "warn",
      "@typescript-eslint/prefer-reduce-type-parameter": "warn",
      "@typescript-eslint/prefer-return-this-type": "warn",
      "@typescript-eslint/prefer-string-starts-ends-with": "warn",
      "@typescript-eslint/prefer-ts-expect-error": "warn",
      "@typescript-eslint/restrict-plus-operands": "warn",
      "@typescript-eslint/restrict-template-expressions": [
        "warn",
        {
          allowAny: false,
          allowArray: false,
          allowBoolean: false,
          allowNullish: false,
          allowRegExp: false,
          allowNever: false,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "warn",
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          considerDefaultExhaustiveForUnions: true,
        },
      ],
      "@typescript-eslint/unified-signatures": "warn",

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "unicorn/consistent-destructuring": "warn",
      "unicorn/no-array-for-each": "warn",
      "unicorn/no-await-in-promise-methods": "warn",
      "unicorn/no-empty-file": "warn",
      "unicorn/no-for-loop": "warn",
      "unicorn/no-instanceof-array": "warn",
      "unicorn/no-invalid-fetch-options": "warn",
      "unicorn/no-invalid-remove-event-listener": "warn",
      "unicorn/no-lonely-if": "warn",
      "unicorn/no-negation-in-equality-check": "warn",
      "unicorn/no-object-as-default-parameter": "warn",
      "unicorn/no-single-promise-in-promise-methods": "warn",
      "unicorn/no-thenable": "warn",
      "unicorn/no-typeof-undefined": "warn",
      "unicorn/no-useless-fallback-in-spread": "warn",
      "unicorn/no-useless-length-check": "warn",
      "unicorn/no-useless-promise-resolve-reject": "warn",
      "unicorn/no-useless-spread": "warn",
      "unicorn/prefer-array-flat": "warn",
      "unicorn/prefer-array-flat-map": "warn",
      "unicorn/prefer-array-index-of": "warn",
      "unicorn/prefer-array-some": "warn",
      "unicorn/prefer-at": "warn",
      "unicorn/prefer-code-point": "warn",
      "unicorn/prefer-default-parameters": "warn",
      "unicorn/prefer-export-from": ["warn", { ignoreUsedVariables: true }],
      "unicorn/prefer-modern-math-apis": "warn",
      "unicorn/prefer-negative-index": "warn",
      "unicorn/prefer-optional-catch-binding": "warn",
      "unicorn/prefer-set-size": "warn",
      "unicorn/prefer-string-replace-all": "warn",
      "unicorn/prefer-string-slice": "warn",
      "unicorn/prefer-string-trim-start-end": "warn",
      "unicorn/prefer-top-level-await": "warn",
      "unicorn/throw-new-error": "warn",

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      ...Object.fromEntries(
        Object.keys(rules).map((rule) => [
          `@arnaud-barre/${rule}`,
          rule === "imports" ? "error" : "warn",
        ]),
      ),
    },
  },
  {
    files: ["src/extensions/**/*.ts"],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/method-signature-style": "off",
    },
  },
);
