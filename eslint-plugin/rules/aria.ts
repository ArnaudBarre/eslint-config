import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { Cases } from "../tests/types.ts";

export const rule: TSESLint.RuleModule<
  | "altText"
  | "ariaAttribute"
  | "role"
  | "unsupported"
  | "iframeTitle"
  | "redundantAlt"
  | "accessKey"
  | "redundantRole"
> = {
  meta: {
    messages: {
      altText: 'Missing alt. Use alt="" for presentational images.',
      ariaAttribute: "Unknown aria attribute.",
      role: "Elements with ARIA roles must use a valid, non-abstract ARIA role.",
      unsupported:
        "This element does not support ARIA roles, states and properties.",
      iframeTitle: "<iframe> elements must have a unique title property.",
      redundantAlt:
        "Redundant alt attribute. Screen-readers already announce <img> elements as an image.",
      accessKey:
        "No access key attribute allowed. Inconsistencies between keyboard shortcuts and keyboard commands used by screenreaders and keyboard-only users create a11y complications.",
      redundantRole: "Redundant role attribute.",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    JSXOpeningElement(node) {
      if (node.name.type === "JSXIdentifier" && node.name.name === "img") {
        const alt = node.attributes.find(
          (a) => a.type === "JSXAttribute" && a.name.name === "alt",
        );
        const value = alt?.type === "JSXAttribute" && alt.value;
        if (value) {
          if (
            value.type === "Literal" &&
            typeof value.value === "string" &&
            redundantAltRe.test(value.value)
          ) {
            context.report({ messageId: "redundantAlt", node: value });
          }
        } else {
          context.report({ messageId: "altText", node });
        }
      }
      if (
        node.name.type === "JSXIdentifier" &&
        dom[node.name.name] && // Reserved
        node.attributes.some(
          (a) =>
            a.type === "JSXAttribute" &&
            a.name.type === "JSXIdentifier" &&
            (a.name.name === "role" || a.name.name.startsWith("aria-")),
        )
      ) {
        context.report({ messageId: "unsupported", node });
      }
      if (
        node.name.type === "JSXIdentifier" &&
        node.name.name === "iframe" &&
        !node.attributes.some(
          (a) =>
            a.type === "JSXAttribute" &&
            a.name.name === "title" &&
            a.value &&
            (a.value.type !== "Literal" || !!a.value.value),
        )
      ) {
        context.report({ messageId: "iframeTitle", node });
      }
      const accessKeyAttribute = node.attributes.find(
        (a) => a.type === "JSXAttribute" && a.name.name === "accessKey",
      );
      if (accessKeyAttribute) {
        context.report({ messageId: "accessKey", node: accessKeyAttribute });
      }
    },
    JSXAttribute(node) {
      if (
        node.name.type === "JSXIdentifier" &&
        node.name.name.startsWith("aria-") &&
        !ariaAttributes.includes(node.name.name)
      ) {
        context.report({ messageId: "ariaAttribute", node: node.name });
      }
      if (
        node.name.type === "JSXIdentifier" &&
        node.name.name === "role" &&
        node.parent.type === "JSXOpeningElement" &&
        node.parent.name.type === "JSXIdentifier" &&
        node.parent.name.name in dom
      ) {
        if (!node.value) {
          context.report({ messageId: "role", node });
        } else if (
          node.value.type === "Literal" &&
          typeof node.value.value === "string"
        ) {
          if (!nonAbstractRoles.includes(node.value.value)) {
            context.report({ messageId: "role", node: node.value });
          }
          const implicitRole = getImplicitRole(
            node.parent.name.name,
            node.parent.attributes,
          );
          if (implicitRole === node.value.value) {
            context.report({ messageId: "redundantRole", node: node.value });
          }
        }
      }
    },
  }),
};

const redundantAltRe = /(?!\{)\b(image|photo|picture)\b(?!\})/iu;

const dom: Record<string, /* reserved */ boolean> = {
  a: false,
  abbr: false,
  acronym: false,
  address: false,
  applet: false,
  area: false,
  article: false,
  aside: false,
  audio: false,
  b: false,
  base: true,
  bdi: false,
  bdo: false,
  big: false,
  blink: false,
  blockquote: false,
  body: false,
  br: false,
  button: false,
  canvas: false,
  caption: false,
  center: false,
  cite: false,
  code: false,
  col: true,
  colgroup: true,
  content: false,
  data: false,
  datalist: false,
  dd: false,
  del: false,
  details: false,
  dfn: false,
  dialog: false,
  dir: false,
  div: false,
  dl: false,
  dt: false,
  em: false,
  embed: false,
  fieldset: false,
  figcaption: false,
  figure: false,
  font: false,
  footer: false,
  form: false,
  frame: false,
  frameset: false,
  h1: false,
  h2: false,
  h3: false,
  h4: false,
  h5: false,
  h6: false,
  head: true,
  header: false,
  hgroup: false,
  hr: false,
  html: true,
  i: false,
  iframe: false,
  img: false,
  input: false,
  ins: false,
  kbd: false,
  keygen: false,
  label: false,
  legend: false,
  li: false,
  link: true,
  main: false,
  map: false,
  mark: false,
  marquee: false,
  menu: false,
  menuitem: false,
  meta: true,
  meter: false,
  nav: false,
  noembed: true,
  noscript: true,
  object: false,
  ol: false,
  optgroup: false,
  option: false,
  output: false,
  p: false,
  param: true,
  picture: true,
  pre: false,
  progress: false,
  q: false,
  rp: false,
  rt: false,
  rtc: false,
  ruby: false,
  s: false,
  samp: false,
  script: true,
  section: false,
  select: false,
  small: false,
  source: true,
  spacer: false,
  span: false,
  strike: false,
  strong: false,
  style: true,
  sub: false,
  summary: false,
  sup: false,
  table: false,
  tbody: false,
  td: false,
  textarea: false,
  tfoot: false,
  th: false,
  thead: false,
  time: false,
  title: true,
  tr: false,
  track: true,
  tt: false,
  u: false,
  ul: false,
  var: false,
  video: false,
  wbr: false,
  xmp: false,
};

// Taken from https://github.com/A11yance/aria-query/blob/main/src/ariaPropsMap.js
const ariaAttributes = [
  "aria-activedescendant",
  "aria-atomic",
  "aria-autocomplete",
  "aria-braillelabel",
  "aria-brailleroledescription",
  "aria-busy",
  "aria-checked",
  "aria-colcount",
  "aria-colindex",
  "aria-colspan",
  "aria-controls",
  "aria-current",
  "aria-describedby",
  "aria-description",
  "aria-details",
  "aria-disabled",
  "aria-dropeffect",
  "aria-errormessage",
  "aria-expanded",
  "aria-flowto",
  "aria-grabbed",
  "aria-haspopup",
  "aria-hidden",
  "aria-invalid",
  "aria-keyshortcuts",
  "aria-label",
  "aria-labelledby",
  "aria-level",
  "aria-live",
  "aria-modal",
  "aria-multiline",
  "aria-multiselectable",
  "aria-orientation",
  "aria-owns",
  "aria-placeholder",
  "aria-posinset",
  "aria-pressed",
  "aria-readonly",
  "aria-relevant",
  "aria-required",
  "aria-roledescription",
  "aria-rowcount",
  "aria-rowindex",
  "aria-rowspan",
  "aria-selected",
  "aria-setsize",
  "aria-sort",
  "aria-valuemax",
  "aria-valuemin",
  "aria-valuenow",
  "aria-valuetext",
];

// Taken from https://github.com/A11yance/aria-query/tree/main/src/etc/roles
const nonAbstractRoles = [
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "blockquote",
  "button",
  "caption",
  "cell",
  "checkbox",
  "code",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "deletion",
  "dialog",
  "directory",
  "document",
  "emphasis",
  "feed",
  "figure",
  "form",
  "generic",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "insertion",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "mark",
  "marquee",
  "math",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "meter",
  "navigation",
  "none",
  "note",
  "option",
  "paragraph",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "strong",
  "subscript",
  "superscript",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "time",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem",
  "graphics-document",
  "graphics-object",
  "graphics-symbol",
  "doc-abstract",
  "doc-acknowledgments",
  "doc-afterword",
  "doc-appendix",
  "doc-backlink",
  "doc-biblioentry",
  "doc-bibliography",
  "doc-biblioref",
  "doc-chapter",
  "doc-colophon",
  "doc-conclusion",
  "doc-cover",
  "doc-credit",
  "doc-credits",
  "doc-dedication",
  "doc-endnote",
  "doc-endnotes",
  "doc-epigraph",
  "doc-epilogue",
  "doc-errata",
  "doc-example",
  "doc-footnote",
  "doc-foreword",
  "doc-glossary",
  "doc-glossref",
  "doc-index",
  "doc-introduction",
  "doc-noteref",
  "doc-notice",
  "doc-pagebreak",
  "doc-pagelist",
  "doc-part",
  "doc-preface",
  "doc-prologue",
  "doc-pullquote",
  "doc-qna",
  "doc-subtitle",
  "doc-tip",
  "doc-toc",
];

type Attributes = TSESTree.JSXOpeningElement["attributes"];
export const getImplicitRole = (element: string, attributes: Attributes) =>
  map[element]?.(attributes);

const hasProp = (attributes: Attributes, name: string) =>
  attributes.some(
    (a) =>
      a.type === "JSXAttribute" &&
      a.name.type === "JSXIdentifier" &&
      a.name.name === name,
  );

const getProp = (attributes: Attributes, name: string) => {
  for (const a of attributes) {
    if (
      a.type === "JSXAttribute" &&
      a.name.type === "JSXIdentifier" &&
      a.name.name === name &&
      a.value?.type === "Literal" &&
      typeof a.value.value === "string"
    ) {
      return a.value.value;
    }
  }
};

const map: Record<
  string,
  | ((
      attributes: TSESTree.JSXOpeningElement["attributes"],
    ) => string | undefined)
  | undefined
> = {
  a: (attributes) => (hasProp(attributes, "href") ? "link" : undefined),
  hr: () => "separator",
  aside: () => "complementary",
  section: () => "region",
  tbody: () => "rowgroup",
  ul: () => "list",
  textarea: () => "textbox",
  h2: () => "heading",
  h6: () => "heading",
  link: (attributes) => (hasProp(attributes, "href") ? "link" : undefined),
  meter: () => "progressbar",
  option: () => "option",
  dialog: () => "dialog",
  body: () => "document",
  h3: () => "heading",
  tfoot: () => "rowgroup",
  h4: () => "heading",
  progress: () => "progressbar",
  select: () => "listbox",
  h1: () => "heading",
  article: () => "article",
  thead: () => "rowgroup",
  output: () => "status",
  h5: () => "heading",
  area: (attributes) => (hasProp(attributes, "href") ? "link" : undefined),
  ol: () => "list",
  menuitem: (attributes) => {
    const type = getProp(attributes, "type");
    switch (type?.toUpperCase()) {
      case "COMMAND":
        return "menuitem";
      case "CHECKBOX":
        return "menuitemcheckbox";
      case "RADIO":
        return "menuitemradio";
      default:
        return undefined;
    }
  },
  details: () => "group",
  button: () => "button",
  datalist: () => "listbox",
  form: () => "form",
  menu: (attributes) => {
    const type = getProp(attributes, "type");
    if (type?.toUpperCase() === "TOOLBAR") return "toolbar";
  },
  img: (attributes) => {
    const alt = getProp(attributes, "alt");
    if (alt !== "") return "img";
  },
  nav: () => "navigation",
  li: () => "listitem",
  input: (attributes) => {
    const type = getProp(attributes, "type");
    switch (type?.toUpperCase()) {
      case "BUTTON":
      case "IMAGE":
      case "RESET":
      case "SUBMIT":
        return "button";
      case "CHECKBOX":
        return "checkbox";
      case "RADIO":
        return "radio";
      case "RANGE":
        return "slider";
      case "EMAIL":
      case "PASSWORD":
      case "SEARCH": // with [list] selector it's combobox
      case "TEL": // with [list] selector it's combobox
      case "URL": // with [list] selector it's combobox
      default:
        return "textbox";
    }
  },
};

export const cases: Cases = {
  valid: [
    {
      name: "Img with alt",
      code: 'return <img alt="" />',
    },
    {
      name: "Valid aria",
      code: "return <div aria-hidden />",
    },
    {
      name: "Valid role",
      code: 'return <div role="button" />',
    },
    {
      name: "Role on non-dom",
      code: 'return <Button role="foo" />',
    },
  ],
  invalid: [
    {
      name: "Img without alt",
      code: 'return <img src="https://example.com" />',
      errorId: "altText",
    },
    {
      name: "Invalid aria",
      code: "return <div aria-foo />",
      errorId: "ariaAttribute",
    },
    {
      name: "Invalid role",
      code: 'return <div role="foo" />',
      errorId: "role",
    },
    {
      name: "Aria on reserved dom",
      code: "return <title aria-hidden />",
      errorId: "unsupported",
    },
    {
      name: "Redundant alt",
      code: 'return <img alt="A picture of a dog" />',
      errorId: "redundantAlt",
    },
    {
      name: "Title-less iframe",
      code: "return <iframe />",
      errorId: "iframeTitle",
    },
    {
      name: "accessKey",
      code: 'return <div accessKey="a" />',
      errorId: "accessKey",
    },
    {
      name: "Redundant role",
      code: 'return <button role="button" />',
      errorId: "redundantRole",
    },
    {
      name: "Redundant role complex",
      code: 'return <input type="submit" role="button" />',
      errorId: "redundantRole",
    },
  ],
};
