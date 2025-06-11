## Rules to replace [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)

- context-display-name: Enforce displayName for React contexts
- jsx-boolean-value: Enforce boolean shorthand
- jsx-data-lowercase: Enforce lowercase data attributes
- jsx-curly-brace-presence: Catch unnecessary curly braces
- jsx-fragments: Enforce shorthand for fragments
- jsx-key: Validate JSX has key prop when in array or iterator
- jsx-no-comment-text-nodes: Catch comments as text nodes
- jsx-no-useless-fragment: Catch useless fragments
- jsx-self-closing: Enforce self-closing tags
- no-danger-with-children: Catch passing both children & dangerouslySetInnerHTML
- void-dom-elements-no-children: Catch passing children to void elements

## Rules to replace [eslint-plugin-import](https://github.com/import-js/eslint-plugin-import)

- imports: Ensure imports are at the top the module, non duplicated and that relative imports use extension and resolve to actual files on disks
- no-default-export: Forbid default export

## Rules to replace [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

- aria:
  - Validates alt text is present and non-redundant (alt-text, img-redundant-alt)
  - Validates `aria-*` & `role` props are valid, non-redundant and used on non-reserved dom elements (aria-props, aria-role, aria-unsupported-elements, no-redundant-roles)
  - Validates `iframe` has `title`
  - Forbids `accessKey` prop (no-access-key)
- autocomplete-valid: Validates value for autocomplete

## Additional rules

- array-callback-return: Ensure array callbacks that require a return value (map, filter, find, some, ...) don't have undefined in their return type
- jsx-no-lonely-template-string: Enforce ``{`Hello ${name}`}`` -> `Hello {name}` in JSX
- jsx-no-number-truthiness: Disallow `list.length && ...` in JSX
- no-unused-property-signature: Check for unused option in functions using object parameters types
- no-useless-template-string: Enforce `` `Hello` `` -> `"Hello"`
- one-line-if: Enforce `if (condition) ...` on one line when possible
- no-alert: Custom implementation of base no-alert rule to not warn for confirm & prompt
