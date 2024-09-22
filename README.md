# eslint-config [![npm](https://img.shields.io/npm/v/@arnaud-barre/eslint-config)](https://www.npmjs.com/package/@arnaud-barre/eslint-config)

## Install

```sh
yarn add --dev eslint @arnaud-barre/eslint-config
```

```js
// eslint.config.js
import baseConfig from "@arnaud-barre/eslint-config";

export default [...baseConfig];
```

```json
// package.json
"scripts": {
  "lint": "bun lint-ci --fix --cache",
  "lint-ci": "eslint . --max-warnings 0"
}
```

## TS config (5.5)

```json
{
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "target": "ES2021",
    "useDefineForClassFields": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    /* Linting */
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "useUnknownInCatchVariables": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### For Node projects

```json
{
  "include": ["**/*.ts"],
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"]

    /* ... */
  }
}
```

## Adding local rules

Here is an example for an hypothetical "no-while" rule (that could simply be achieved by using the [no-restricted-syntax rule](https://eslint.org/docs/latest/rules/no-restricted-syntax))

```js
// eslint.config.js
import baseConfig from "@arnaud-barre/eslint-config";
import tseslint from "typescript-eslint";

/**
 * @type {import("@typescript-eslint/utils").TSESLint.RuleModule<"error">}
 */
const noWhileRule = {
  meta: {
    messages: { error: "Don't use while" },
    type: "problem",
    schema: [],
  },
  create: (context) => ({
    WhileStatement(node) {
      context.report({ node, messageId: "error" });
    },
  }),
};

export default tseslint.config(...baseConfig, {
  plugins: {
    local: {
      rules: {
        "no-while": noWhileRule,
      },
    },
  },
  rules: {
    "local/no-while": "warn",
  },
});
```
