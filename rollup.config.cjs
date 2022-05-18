const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const { terser } = require("rollup-plugin-terser");

module.exports = (args) => {
  let inProduction = false;

  if (process.env.NODE_ENV) {
    inProduction = process.env.NODE_ENV.toLowerCase() === "production";
  }

  if (process.env.BUILD) {
    inProduction = process.env.BUILD.toLowerCase() === "production";
  }

  const DIST_FOLDER_NAME = "dist";
  const DEV_BUILD_FOLDER_NAME = ".dev.build";

  /** @type {import("rollup").RollupOptions} */
  const options = {
    input: "src/index.ts",
    output: {
      sourcemap: false,
      dir: inProduction ? DIST_FOLDER_NAME : DEV_BUILD_FOLDER_NAME,
      format: "es",
    },

    plugins: [
      commonjs(),
      typescript({
        outputToFilesystem: true,
        compilerOptions: {
          outDir: inProduction ? DIST_FOLDER_NAME : DEV_BUILD_FOLDER_NAME,
        },
      }),
      json(),
      inProduction ? nodeResolve() : null,
      inProduction ? terser() : null,
    ],
  };

  return options;
};
