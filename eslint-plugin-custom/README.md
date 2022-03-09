# eslint-plugin-custom [![npm](https://img.shields.io/npm/v/arnaud-barre/eslint-plugin-custom)](https://www.npmjs.com/package/arnaud-barre/eslint-plugin-custom)

Custom rules for `@arnaud-barre/eslint-config`:

- jsx-no-lonely-template-string: Enforce `` {`Hello ${name}`} `` -> `Hello {name}` in JSX
- jsx-no-number-truthiness: Disallow `list.length && ...` in JSX
- no-useless-template-string: Enforce `` `Hello` `` -> `"Hello"`
- one-line-if: Enforce `if (condition) ...` on one line when possible
