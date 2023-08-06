import { readdirSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { build } from "esbuild";
import packageJSON from "./package.json";

rmSync("dist", { force: true, recursive: true });

const files = readdirSync("rules");

const lines = [
  ...files.map((f, i) => `import { rule as rule${i} } from "./rules/${f}";`),
  "export const rules = {",
  ...files.map((f, i) => `  "${f.slice(0, -3)}": rule${i},`),
  "};",
];

await build({
  bundle: true,
  stdin: { contents: lines.join("\n"), resolveDir: "." },
  outfile: "dist/index.js",
  platform: "node",
  target: "node18",
  format: "cjs",
  packages: "external",
});
execSync("cp LICENSE README.md dist/");

writeFileSync(
  "dist/package.json",
  JSON.stringify(
    {
      name: "@arnaud-barre/eslint-plugin",
      description: "Additional rules for @arnaud-barre/eslint-config",
      version: packageJSON.version,
      author: "Arnaud Barré (https://github.com/ArnaudBarre)",
      license: packageJSON.license,
      repository: "github:ArnaudBarre/eslint-config",
      main: "index.js",
      dependencies: packageJSON.dependencies,
    },
    null,
    2,
  ),
);
