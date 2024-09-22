import tseslint from "typescript-eslint";
import baseConfig from "./dist/index.js";

export default tseslint.config({ ignores: ["plugin/tests"] }, ...baseConfig);
