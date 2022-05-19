/* eslint-disable */
const esbuild = require("esbuild");
const rimraf = require("rimraf");
const childProcess = require("child_process");
const path = require("path");
const commandLineArgs = require("command-line-args");
const clc = require("cli-color");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

const success = clc.green.bold;
const warning = clc.yellow.bold;
const message = clc.blue.bold;
const error = clc.red.bold;

async function main() {
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
      message(
        "🔥 Running in watch mode. The project will be rebuilt and rerun upon changes.\n",
      ),
    );
  }

  if (options.prod) {
    console.log(
      message(
        "🔥 Building project in production mode. This will bundle and minify the project and remove unused code.\n",
      ),
    );
  }

  if (options.watch && options.prod) {
    console.warn(
      warning(
        `You're running in watch mode and in production mode. This is not recommended.
Production mode will build the project with optimizations enabled and without sourcemaps which is not suitable for a development environment.
Remove the --prod/-p flag to turn off production mode.\n
`,
      ),
    );
  }

  await build({
    inProd: options.prod,
    watch: options.watch,
    outDir: options.outdir,
    watchOutDir: options["watch-outdir"],
    entryPoint: options["entry-point"],
  });
}

async function build({ inProd, outDir, watch, watchOutDir, entryPoint }) {
  const outputDestination = watch ? watchOutDir : outDir;

  rimraf.sync(outputDestination);

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

  const plugins = [];

  if (watch) {
    plugins.push(nodeExternalsPlugin());
  }

  const result = await esbuild
    .build({
      plugins: plugins.length > 0 ? plugins : undefined,
      entryPoints: [entryPoint],
      bundle: true,
      treeShaking: inProd,
      outdir: outputDestination,
      platform: "node",
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
        onRebuild: (err, _res) => {
          if (err) {
            console.error(err, "\n");
            console.log(
              error(
                "X Encountered an error when building. Watching for changes before rebuild...\n",
              ),
            );
            return;
          }
          console.log(success("✓ Rebuild successful!\n"));

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

  console.log(
    success(
      `✓ Build successful!
✓ Output located at ${path.resolve(__dirname, outputDestination)}\n`,
    ),
  );

  return result;
}

main();
