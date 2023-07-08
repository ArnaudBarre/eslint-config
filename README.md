# eslint-config [![npm](https://img.shields.io/npm/v/@arnaud-barre/eslint-config)](https://www.npmjs.com/package/@arnaud-barre/eslint-config)

## Install

```sh
yarn add --dev eslint @arnaud-barre/eslint-config
```

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  extends: ["@arnaud-barre"],
};
```

```json
// package.json
"scripts": {
  "lint": "yarn lint-ci --fix --cache",
  "lint-ci": "eslint ./ --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
}
```

## TS config

```json
{
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
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

## Adding local rules

Local rules are loaded from `eslint-plugin/index.js`. Here is an example for an hypothetical "no-while" rule (that could simply be achieved by using the [no-restricted-syntax rule](https://eslint.org/docs/latest/rules/no-restricted-syntax))

```js
// eslint-plugin/index.js
exports.rules = {
  "no-while": {
    meta: {
      messages: { error: "Don't use while" },
      type: "problem",
      schema: [],
    },
    create: (context) => ({
      WhileStatement: (node) => {
        context.report({ node, messageId: "error" });
      },
    }),
  },
};
```

```js
//  .eslintrc.js
module.exports = {
  root: true,
  extends: ["@arnaud-barre"],
  rules: {
    "@arnaud-barre/local/no-while": "warn",
  },
};
```
