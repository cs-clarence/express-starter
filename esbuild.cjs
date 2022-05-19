/* eslint-disable */
const esbuild = require("esbuild");
const rimraf = require("rimraf");
const childProcess = require("child_process");
const path = require("path");
const commandLineArgs = require("command-line-args");

function main() {
  /**@type {[import("command-line-args").OptionDefinition]} */
  const optionsDefinitions = [
    {
      name: "prod",
      alias: "p",
      type: Boolean,
      defaultValue: false,
    },
    {
      name: "watch",
      alias: "w",
      type: Boolean,
      defaultValue: false,
    },
    {
      name: "outdir",
      alias: "o",
      type: String,
      defaultValue: "dist",
    },
    {
      name: "watch-outdir",
      alias: "d",
      type: String,
      defaultValue: ".esbuild",
    },
    {
      name: "entry-point",
      alias: "e",
      type: String,
      defaultValue: "src/index.ts",
    },
  ];

  const options = commandLineArgs(optionsDefinitions);

  console.log(options);

  if (options.watch && options.prod) {
    console.warn(
      `You're running in watch mode and in production mode. This is not recommended.
Production mode will build the project with optimizations enabled and without sourcemaps which is not suitable for a development environment.
Remove the --prod flag to continue to turn off production mode.
`,
    );
  }

  build({
    inProd: options.prod,
    watch: options.watch,
    outdir: options.outdir,
    watchOutDir: options["watch-outdir"],
    entryPoint: options["entry-point"],
  });
}

async function build({
  inProd,
  outdir = "dist",
  watch = false,
  watchOutDir = ".esbuild",
  entryPoint = "src/index.ts",
}) {
  rimraf.sync(outdir);

  let runningChildProcess = null;

  function runOutputFile() {
    if (runningChildProcess) {
      runningChildProcess.kill();
    }

    let fileName = path.basename(entryPoint);
    fileName = fileName.replace(path.extname(fileName), ".js");

    runningChildProcess = childProcess.spawn(
      "node",
      [`${watchOutDir}/${fileName}`],
      { cwd: process.cwd(), stdio: "inherit" },
    );
  }

  const result = await esbuild
    .build({
      entryPoints: [entryPoint],
      bundle: true,
      treeShaking: inProd,
      outExtension: { ".js": ".ts" },
      outdir,
      platform: "node",
      // external: IN_PROD ? null : ["./node_modules"],
      format: "esm",
      minify: inProd,
      sourcemap: inProd ? false : "inline",
      splitting: inProd,
      incremental: watch,
      define: {
        "process.env.NODE_ENV": inProd ? "production" : "development",
        "process.env.BUILD": inProd ? "production" : "development",
      },
      watch: watch && {
        onRebuild: (error, result) => {
          if (error) {
            console.error(error);
            console.log("Watching for changes before rebuild...");
            return;
          }
          console.log("Rebuild successful!");

          runOutputFile();
        },
      },
    })
    .catch(() => {
      process.exit(1);
    });

  if (watch) {
    runOutputFile();
  }

  return result;
}

main();
