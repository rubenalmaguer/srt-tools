import fs from "fs";
const entities = fs.readdirSync(".", { withFileTypes: true});
const onlyDirs = entities.filter(ent => ent.isDirectory());

// Only the names of tool directories are valid arguments 
const VALID_ARGS = onlyDirs.map(dirEnt => dirEnt.name);
const arg = process.argv[2];
if (!VALID_ARGS.includes(arg)) {
    console.log(`\x1b[30m\x1b[41m Invalid argument \x1b[0m`);
    console.log(`\x1b[31m The argument must be a tool directory's name. \x1b[0m`);
    process.exit()
}

const pathToScript = `./${arg}/main.js`

import { execFile } from 'child_process';

execFile('node', [pathToScript], (error, stdout, stderr) => {
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
