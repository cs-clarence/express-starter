/* eslint-disable */
const esbuild = require("esbuild");
const rimraf = require("rimraf");
const childProcess = require("child_process");
const path = require("path");
const commandLineArgs = require("command-line-args");
const clc = require("cli-color");

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

  if (options.watch) {
    console.log(
      clc.blue.bold(
        "Running in watch mode. The project will be rebuilt and rerun on changes.",
      ),
    );
  }

  if (options.prod) {
    console.log(
      clc.blue.bold(
        "Building project in production mode. This will bundle and minify the project and remove unused code.",
      ),
    );
  }

  if (options.watch && options.prod) {
    console.warn(
      clc.yellow.bold(
        `You're running in watch mode and in production mode. This is not recommended.
Production mode will build the project with optimizations enabled and without sourcemaps which is not suitable for a development environment.
Remove the --prod/-p flag to turn off production mode.
`,
      ),
    );
  }

  build({
    inProd: options.prod,
    watch: options.watch,
    outDir: options.outdir,
    watchOutDir: options["watch-outdir"],
    entryPoint: options["entry-point"],
  });
}

async function build({ inProd, outDir, watch, watchOutDir, entryPoint }) {
  rimraf.sync(inProd ? outDir : watchOutDir);

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
      outdir: inProd ? outDir : watchOutDir,
      platform: "node",
      external: inProd ? [] : ["./node_modules"],
      format: "cjs",
      minify: inProd,
      sourcemap: inProd ? false : "linked",
      // splitting: inProd,
      incremental: watch,
      define: {
        "process.env.NODE_ENV": inProd ? '"production"' : '"development"',
        "process.env.BUILD": inProd ? '"production"' : '"development"',
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
