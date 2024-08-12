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

console.log(actions);

process.exit();

const arg = process.argv[2];
if (!actions.includes(arg)) {
  console.log(`\x1b[30m\x1b[41m Invalid argument \x1b[0m`);
  console.log(`\x1b[31m The argument must be a tool directory's name. \x1b[0m`);
  process.exit();
}

// Execute main script of requested action
execFile("node", [`./actions/${arg}.js`], (error, stdout, stderr) => {
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
