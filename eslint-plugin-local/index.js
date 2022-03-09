const { existsSync } = require("fs");
const { join } = require("path");

const path = join(__dirname, "../../../eslint-plugin/index.js");
module.exports = existsSync(path) ? require(path) : { rules: {} };
