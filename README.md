# eslint-config [![npm](https://img.shields.io/npm/v/arnaud-barre/eslint-config)](https://www.npmjs.com/package/arnaud-barre/eslint-config)

## Install

```sh
yarn add --dev @arnaud-barre/eslint-config
```

## .eslintrc.js

```js
module.exports = {
  root: true,
  extends: ["@arnaud-barre"],
  rules: {
    "@arnaud-barre/local/no-while": "warn",
  },
};
```

## package.json

```json
{
  "scripts": {
    "lint": "yarn lint-ci --fix --cache",
    "lint-ci": "eslint ./ --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## eslint-plugin/index.js

```js
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
