const { join } = require("path");

/*
 The goal is to fill in the gap between a strict TS & prettier without overlap
 The rules are adapted for class-less React TS codebase
 Inspired by https://github.com/facebook/create-react-app/tree/master/packages/eslint-config-react-app
*/

/*
 The ESLint browser environment defines all browser globals as valid,
 even though most people don't know some of them exist (e.g. `name` or `status`).
 This is dangerous as it hides accidentally undefined variables.
 We blacklist the globals that we deem potentially confusing.
 To use them, explicitly reference them, e.g. `window.name` or `window.status`.
*/
const restrictedGlobals = require("confusing-browser-globals");

module.exports = {
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["dist", "**/*.js"],
  plugins: [
    "@typescript-eslint",
    "import",
    "unicorn",
    "react",
    "react-hooks",
    "jsx-a11y",
    "react-refresh",
    "@arnaud-barre/custom",
    "@arnaud-barre/local",
  ],
  env: { browser: true, node: true },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    project: ["./tsconfig.json", "./*/tsconfig.json"],
    tsconfigRootDir: join(__dirname, "../../.."),
    warnOnUnsupportedTypeScriptVersion: true,
  },
  settings: {
    "react": { version: "17.0" },
    "import/resolver": {
      typescript: { project: ["./tsconfig.json", "./*/tsconfig.json"] },
    },
  },

  rules: {
    // https://eslint.org/docs/rules
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
    "array-callback-return": "warn",
    "curly": ["warn", "multi-line", "consistent"],
    "default-param-last": "warn",
    "dot-notation": "warn",
    "eqeqeq": "warn",
    "no-alert": "warn",
    "no-caller": "warn",
    "no-else-return": "warn",
    "no-empty-pattern": "warn",
    "no-eval": "warn",
    "no-global-assign": "warn",
    "no-iterator": "warn",
    "no-labels": "warn",
    "no-lone-blocks": "warn",
    "no-loop-func": "warn",
    "no-multi-str": "warn",
    "no-new": "warn",
    "no-new-func": "warn",
    "no-new-wrappers": "warn",
    "no-octal-escape": "warn",
    "no-param-reassign": "warn",
    "no-return-assign": "warn",
    "no-return-await": "warn",
    "no-script-url": "warn",
    "no-self-assign": "warn",
    "no-self-compare": "warn",
    "no-throw-literal": "warn",
    "no-useless-call": "warn",
    "no-useless-catch": "warn",
    "no-useless-concat": "warn",
    "no-useless-escape": "warn",
    "no-useless-return": "warn",
    "no-void": "warn",
    "prefer-promise-reject-errors": "warn",
    "prefer-regex-literals": "warn",
    "require-unicode-regexp": "warn",
    "wrap-iife": "warn",
    "yoda": "warn",
    "strict": "warn",
    "one-var": ["warn", "never"],
    "no-delete-var": "warn",
    "no-restricted-globals": ["error"].concat(restrictedGlobals),
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
    "no-negated-condition": "warn",
    "no-new-object": "warn",
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
    "no-new-symbol": "warn",
    "no-useless-computed-key": "warn",
    "no-useless-rename": "warn",
    "no-var": "warn",
    "object-shorthand": "warn",
    "prefer-arrow-callback": "warn",
    "prefer-const": "warn",
    "prefer-rest-params": "warn",
    "prefer-spread": "warn",
    "prefer-template": "warn",
    "require-yield": "warn",

    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
    "@typescript-eslint/array-type": "warn",
    "@typescript-eslint/await-thenable": "warn",
    "@typescript-eslint/ban-types": [
      "warn",
      {
        types: {
          Boolean: "Use boolean instead",
          Object: "Use Record<string, unknown> instead",
          String: "Use string instead",
        },
      },
    ],
    "@typescript-eslint/consistent-type-assertions": "warn",
    "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        selector: "default",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
        filter: { regex: "^__", match: false },
      },
      { selector: "typeLike", format: ["PascalCase"] },
      {
        selector: ["objectLiteralProperty", "typeProperty"],
        format: null,
        modifiers: ["requiresQuotes"],
      },
    ],
    "@typescript-eslint/no-array-constructor": "warn",
    "@typescript-eslint/no-confusing-void-expression": [
      "warn",
      { ignoreArrowShorthand: true },
    ],
    "@typescript-eslint/no-duplicate-imports": "warn",
    "@typescript-eslint/no-dynamic-delete": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-extra-non-null-assertion": "warn",
    "@typescript-eslint/no-for-in-array": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",
    "@typescript-eslint/no-misused-promises": [
      "warn",
      // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-misused-promises.md#checksvoidreturn
      { checksVoidReturn: { arguments: false, attributes: false } },
    ],
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "@typescript-eslint/no-shadow": ["warn", { builtinGlobals: false }], // globals should be explicitly used
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "@typescript-eslint/no-unnecessary-type-arguments": "warn",
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    "@typescript-eslint/no-unused-expressions": [
      "warn",
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-use-before-define": [
      "warn",
      { variables: false, classes: false },
    ],
    "@typescript-eslint/no-useless-empty-export": "warn",
    "@typescript-eslint/no-useless-constructor": "warn",
    "@typescript-eslint/no-redundant-type-constituents": "warn",
    "@typescript-eslint/non-nullable-type-assertion-style": "warn",
    "@typescript-eslint/prefer-includes": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/prefer-string-starts-ends-with": "warn",
    "@typescript-eslint/require-await": "warn",
    "@typescript-eslint/restrict-plus-operands": [
      "warn",
      { checkCompoundAssignments: true },
    ],
    "@typescript-eslint/restrict-template-expressions": [
      "warn",
      { allowNumber: true, allowBoolean: true },
    ],
    "@typescript-eslint/unified-signatures": "warn",

    // https://github.com/benmosher/eslint-plugin-import#rules
    "import/no-unresolved": ["error", { ignore: ["^virtual:"] }],
    "import/first": "error",
    "import/no-amd": "error",
    "import/no-default-export": "warn",
    "import/no-self-import": "error",
    "import/no-webpack-loader-syntax": "error",

    // https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules
    "react/destructuring-assignment": "warn",
    "react/jsx-boolean-value": "warn",
    "react/jsx-curly-brace-presence": "warn",
    "react/jsx-fragments": "warn",
    "react/jsx-key": ["warn", { checkFragmentShorthand: true }],
    "react/jsx-no-comment-textnodes": "warn",
    "react/jsx-no-duplicate-props": "warn",
    "react/jsx-no-target-blank": "warn",
    "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }], // TODO: Remove allowExpressions if https://github.com/microsoft/TypeScript/issues/21699 is fixed
    "react/jsx-pascal-case": ["warn", { allowAllCaps: true }],
    "react/no-danger-with-children": "warn",
    "react/self-closing-comp": "warn",
    "react/style-prop-object": "warn",
    "react/void-dom-elements-no-children": "warn",

    // https://github.com/facebook/react/tree/master/packages/eslint-plugin-react-hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // https://github.com/sindresorhus/eslint-plugin-unicorn#rules
    "unicorn/consistent-destructuring": "warn",
    "unicorn/no-array-instanceof": "warn",
    "unicorn/no-for-loop": "warn", // Smarter than eslint/prefer-for-of
    "unicorn/no-invalid-remove-event-listener": "warn",
    "unicorn/no-lonely-if": "warn", // More cases than eslint/no-lonely-if
    "unicorn/no-object-as-default-parameter": "warn",
    "unicorn/no-thenable": "warn",
    "unicorn/no-useless-fallback-in-spread": "warn",
    "unicorn/no-useless-length-check": "warn",
    "unicorn/no-useless-promise-resolve-reject": "warn",
    "unicorn/no-useless-spread": "warn",
    "unicorn/prefer-array-find": "warn",
    "unicorn/prefer-array-flat": "warn",
    "unicorn/prefer-array-flat-map": "warn",
    "unicorn/prefer-array-index-of": "warn",
    "unicorn/prefer-array-some": "warn",
    "unicorn/prefer-at": "warn",
    "unicorn/prefer-code-point": "warn",
    "unicorn/prefer-default-parameters": "warn",
    "unicorn/prefer-export-from": ["warn", { ignoreUsedVariables: true }],
    "unicorn/prefer-negative-index": "warn",
    "unicorn/prefer-optional-catch-binding": "warn",
    "unicorn/prefer-string-replace-all": "warn",
    "unicorn/prefer-string-slice": "warn",
    "unicorn/prefer-string-trim-start-end": "warn",
    // "unicorn/prefer-ternary": "warn", TODO: enable if https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1079 is fixed
    "unicorn/throw-new-error": "warn",

    // https://github.com/evcohen/eslint-plugin-jsx-a11y#supported-rules
    "jsx-a11y/alt-text": "warn",
    "jsx-a11y/anchor-has-content": "warn",
    "jsx-a11y/aria-activedescendant-has-tabindex": "warn",
    "jsx-a11y/aria-props": "warn",
    "jsx-a11y/aria-proptypes": "warn",
    "jsx-a11y/aria-role": ["warn", { ignoreNonDOM: true }],
    "jsx-a11y/aria-unsupported-elements": "warn",
    "jsx-a11y/autocomplete-valid": [
      "warn",
      { inputComponents: ["Input", "FormInput"] },
    ],
    "jsx-a11y/heading-has-content": "warn",
    "jsx-a11y/iframe-has-title": "warn",
    "jsx-a11y/img-redundant-alt": "warn",
    "jsx-a11y/no-access-key": "warn",
    "jsx-a11y/no-distracting-elements": "warn",
    "jsx-a11y/no-interactive-element-to-noninteractive-role": "warn",
    "jsx-a11y/no-noninteractive-tabindex": "warn",
    "jsx-a11y/no-redundant-roles": "warn",
    "jsx-a11y/role-has-required-aria-props": "warn",
    "jsx-a11y/role-supports-aria-props": "warn",
    "jsx-a11y/scope": "warn",

    // https://github.com/ArnaudBarre/eslint-plugin-react-refresh
    "react-refresh/only-export-components": "warn",

    // https://github.com/ArnaudBarre/eslint-plugin-react-refresh
    "@arnaud-barre/custom/jsx-no-lonely-template-string": "warn",
    "@arnaud-barre/custom/jsx-no-number-truthiness": "warn",
    "@arnaud-barre/custom/no-useless-template-string": "warn",
    "@arnaud-barre/custom/one-line-if": "warn",
  },

  overrides: [
    {
      files: "src/extensions/**",
      rules: {
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
      },
    },
  ],
};
