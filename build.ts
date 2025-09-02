import { execSync } from "node:child_process";
import { readdirSync, rmSync, writeFileSync } from "node:fs";
import { build } from "esbuild";
import packageJSON from "./package.json" with { type: "json" };

rmSync("dist", { force: true, recursive: true });

const files = readdirSync("plugin/rules");

const lines = [
  "// Generated via build command",
  ...files.map((f, i) => `import { rule as rule${i} } from "./rules/${f}";`),
  "",
  "export const rules = {",
  ...files.map((f, i) => `  "${f.slice(0, -3)}": rule${i},`),
  "};",
  "",
];

writeFileSync("plugin/index.ts", lines.join("\n"));

await build({
  bundle: true,
  entryPoints: ["index.ts"],
  outfile: "dist/index.js",
  platform: "node",
  target: "node18",
  format: "esm",
  packages: "external",
});
execSync("cp LICENSE README.md dist/");

writeFileSync(
  "dist/package.json",
  JSON.stringify(
    {
      name: packageJSON.name,
      description: packageJSON.description,
      version: packageJSON.version,
      author: packageJSON.author,
      license: packageJSON.license,
      repository: "github:ArnaudBarre/eslint-config",
      type: "module",
      main: "index.js",
      peerDependencies: packageJSON.peerDependencies,
      dependencies: packageJSON.dependencies,
    },
    null,
    2,
  ),
);
