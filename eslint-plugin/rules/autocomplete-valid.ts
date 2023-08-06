import { TSESLint } from "@typescript-eslint/utils";
import { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<"error"> = {
  meta: {
    messages: { error: "Invalid value" },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXAttribute(node) {
      if (
        node.name.type === "JSXIdentifier" &&
        node.name.name === "autoComplete" &&
        node.parent.type === "JSXOpeningElement" &&
        node.parent.name.type === "JSXIdentifier" &&
        node.parent.name.name.toLowerCase().includes("input") &&
        (!node.value ||
          (node.value.type === "Literal" &&
            typeof node.value.value === "string" &&
            !isValidAutocomplete(node.value.value)))
      ) {
        context.report({ messageId: "error", node: node.value ?? node });
      }
    },
  }),
};

// https://github.com/dequelabs/axe-core/blob/develop/lib/commons/text/is-valid-autocomplete.js
const stateTerms = ["on", "off"];
const standaloneTerms = [
  "name",
  "honorific-prefix",
  "given-name",
  "additional-name",
  "family-name",
  "honorific-suffix",
  "nickname",
  "username",
  "new-password",
  "current-password",
  "organization-title",
  "organization",
  "street-address",
  "address-line1",
  "address-line2",
  "address-line3",
  "address-level4",
  "address-level3",
  "address-level2",
  "address-level1",
  "country",
  "country-name",
  "postal-code",
  "cc-name",
  "cc-given-name",
  "cc-additional-name",
  "cc-family-name",
  "cc-number",
  "cc-exp",
  "cc-exp-month",
  "cc-exp-year",
  "cc-csc",
  "cc-type",
  "transaction-currency",
  "transaction-amount",
  "language",
  "bday",
  "bday-day",
  "bday-month",
  "bday-year",
  "sex",
  "url",
  "photo",
  "one-time-code",
];
const qualifiers = ["home", "work", "mobile", "fax", "pager"];
const qualifiedTerms = [
  "tel",
  "tel-country-code",
  "tel-national",
  "tel-area-code",
  "tel-local",
  "tel-local-prefix",
  "tel-local-suffix",
  "tel-extension",
  "email",
  "impp",
];
const locations = ["billing", "shipping"];

const isValidAutocomplete = (_value: string) => {
  const value = _value.toLowerCase().trim();
  if (stateTerms.includes(value) || value === "") return true;

  const autocompleteTerms = value.split(" ");

  if (autocompleteTerms.at(-1) === "webauthn") {
    autocompleteTerms.pop();
    if (autocompleteTerms.length === 0) return false;
  }

  if (autocompleteTerms[0].startsWith("section-")) autocompleteTerms.shift();
  if (locations.includes(autocompleteTerms[0])) autocompleteTerms.shift();

  if (qualifiers.includes(autocompleteTerms[0])) {
    autocompleteTerms.shift();
    // only quantifiers allowed at this point
    if (autocompleteTerms.length !== 1) return false;
    return qualifiedTerms.includes(autocompleteTerms[0]);
  }

  if (autocompleteTerms.length !== 1) return false;

  return (
    standaloneTerms.includes(autocompleteTerms[0]) ||
    qualifiedTerms.includes(autocompleteTerms[0])
  );
};

export const cases: Cases = {
  valid: [
    {
      name: "Simple",
      code: 'return <input autoComplete="new-password" />',
    },
    {
      name: "Complex",
      code: 'return <input autoComplete="shipping work email" />',
    },
    {
      name: "non-input",
      code: 'return <Component autoComplete="foo" />',
    },
  ],
  invalid: [
    {
      name: "Invalid",
      code: 'return <input autoComplete="foo" />',
    },
    {
      name: "Invalid with qualifier",
      code: 'return <input autoComplete="work username" />',
    },
  ],
};
