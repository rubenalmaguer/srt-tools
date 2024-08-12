import fs from "fs";
import { execFile } from "child_process";

// Validate argument
let actions = fs.readdirSync("./actions", { withFileTypes: true });
actions = actions.filter((ent) => ent.isDirectory());
actions = onlyDirs.map((dirEnt) => dirEnt.name);

const arg = process.argv[2];
if (!actions.includes(arg)) {
  console.log(`\x1b[30m\x1b[41m Invalid argument \x1b[0m`);
  console.log(`\x1b[31m The argument must be a tool directory's name. \x1b[0m`);
  process.exit();
}

// Execute main script of requested action
execFile("node", [`./actions/${arg}/main.js`], (error, stdout, stderr) => {
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
