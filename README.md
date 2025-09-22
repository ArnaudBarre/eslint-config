# eslint-config [![npm](https://img.shields.io/npm/v/@arnaud-barre/eslint-config)](https://www.npmjs.com/package/@arnaud-barre/eslint-config)

> [!IMPORTANT]
> Starting in v6, this package ships without type-aware linting and should we used with https://www.npmjs.com/package/@arnaud-barre/type-lint-config

## Install

```sh
yarn add --dev eslint @arnaud-barre/eslint-config
```

```js
// eslint.config.js
import baseConfig from "@arnaud-barre/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(baseConfig);
```

```json
// package.json
"scripts": {
  "lint": "eslint --max-warnings 0 --concurrency auto"
}
```

## TS config (5.9)

### Web project

```json
{
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleDetection": "force",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "tsl/patches"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "useUnknownInCatchVariables": true,
    "noUncheckedSideEffectImports": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### Node project (22)

```json
{
  "include": ["**/*.ts"],
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleDetection": "force",
    "lib": ["es2024", "ESNext.Array", "ESNext.Collection", "ESNext.Iterator"],
    "types": ["node", "tsl/patches"],
    "skipLibCheck": true

    /* Same as web */
  }
}
```

### Node project (24)

```json
{
  "include": ["**/*.ts"],
  "compilerOptions": {
    "target": "ES2024",
    "module": "ESNext",
    "moduleDetection": "force",
    "lib": [
      "es2024",
      "ESNext.Array",
      "ESNext.Collection",
      "ESNext.Iterator",
      "ESNext.Promise"
    ],
    "types": ["node", "tsl/patches"],
    "skipLibCheck": true

    /* Same as web */
  }
}
```

## Prettier config (3.6.2)

### Web projects

```json
// package.json
"prettier": {
  "experimentalOperatorPosition": "start",
  "xmlWhitespaceSensitivity": "ignore",
  "plugins": [
    "@arnaud-barre/prettier-plugin-sort-imports",
    "@prettier/plugin-xml"
  ]
}
```

### Node projects

```json
// package.json
"prettier": {
  "experimentalOperatorPosition": "start",
  "plugins": [
    "@arnaud-barre/prettier-plugin-sort-imports"
  ]
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
