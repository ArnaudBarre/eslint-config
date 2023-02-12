export const rules = {
  "jsx-no-lonely-template-string":
    require("./rules/jsx-no-lonely-template-string").rule,
  "jsx-no-number-truthiness": require("./rules/jsx-no-number-truthiness").rule,
  "no-unused-property-signature":
    require("./rules/no-unused-property-signature").rule,
  "no-useless-template-string": require("./rules/no-useless-template-string")
    .rule,
  "one-line-if": require("./rules/one-line-if").rule,
};
