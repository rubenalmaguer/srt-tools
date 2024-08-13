import fs from "fs";
import path from "node:path";
import { execFile } from "child_process";

// Validate argument
let actions = fs
  .readdirSync("./actions", { withFileTypes: true })
  .filter((ent) => ent.isFile())
  .map((file) => file.name)
  .filter((s) => ".js" === path.extname(s).toLocaleLowerCase())
  .map((s) => path.parse(s).name);

const arg = process.argv[2];
if (!actions.includes(arg)) {
  console.log(`\x1b[30m\x1b[41m Invalid argument \x1b[0m`);
  console.log(`\x1b[31m The argument must be a tool directory's name. \x1b[0m`);
  process.exit();
}

// Read config
const DEFAULT_IN = String.raw`.\input`;
const DEFAULT_OUT = String.raw`.\output`;

let inputDir = process.env.INPUT_FOLDER || DEFAULT_IN;
let outputDir = process.env.OUTPUT_FOLDER || DEFAULT_OUT;

if (process.env.PREFER_DEFAULT_FOLDERS.toUpperCase() === "TRUE") {
  inputDir = DEFAULT_IN;
  outputDir = DEFAULT_OUT;
}

// Execute requested action's script
const script = `./actions/${arg}.js`;
execFile("node", [script, inputDir, outputDir], (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing script: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error output: ${stderr}`);
    return;
  }
  console.log(stdout);
});
