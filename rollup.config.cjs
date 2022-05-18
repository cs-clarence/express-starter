const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const { terser } = require("rollup-plugin-terser");

module.exports = (args) => {
  let production = false;

  if (process.env.NODE_ENV) {
    production = process.env.NODE_ENV.toLowerCase() === "production";
  }

  if (process.env.BUILD) {
    production = process.env.BUILD.toLowerCase() === "production";
  }

  /** @type {import("rollup").RollupOptions} */
  const options = {
    input: "src/index.ts",
    output: {
      sourcemap: false,
      dir: production ? "dist" : ".dev.build",
      format: "es",
    },

    plugins: [
      commonjs(),
      typescript({
        outputToFilesystem: true,
        compilerOptions: {
          outDir: production ? "dist" : ".dev.build",
        },
      }),
      json(),
      production ? nodeResolve() : null,
      production ? terser() : null,
    ],
  };

  return options;
};
