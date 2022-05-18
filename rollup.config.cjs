const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const { terser } = require("rollup-plugin-terser");
const { defineConfig } = require("rollup");

module.exports = defineConfig({
  input: "src/index.ts",

  output: {
    sourcemap: "hidden",
    dir: "dist",
    format: "cjs",
  },

  plugins: [
    commonjs(),
    typescript({ outputToFilesystem: true }),
    json(),
    nodeResolve(),
    terser(),
  ],
});
