// Get this file's path (__dirname only available in CommonJS)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Actual script
import fs from "fs";
import { parseSync, stringifySync } from "subtitle";

//const INPUT_DIR_NAME = `W:/F/V/Spoon Radio/ES/no-br`;
const INPUT_DIR_NAME = `${__dirname}/input`;
const OUTPUT_DIR_NAME = `${__dirname}/output`;

const MAX_CHAR_COUNT = 30;

const allFileNames = fs.readdirSync(INPUT_DIR_NAME);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

if (!validFileNames.length) {
  console.log(`\x1b[31m No files to process. \x1b[0m`);
  process.exit();
}

for (let fileName of validFileNames) {
  const rawContent = fs.readFileSync(`${INPUT_DIR_NAME}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");

  let changeCount = 0; // If > 0, write new file w/changes
  cues.forEach((cue) => {
    // Already short enuogh?
    let text = cue.data.text;
    if (text.length < MAX_CHAR_COUNT) return;

    // Maybe just too many spaces?
    text = text.trim().replaceAll(/\s+/g, " ");
    if (text.length < MAX_CHAR_COUNT) {
      cue.data.text = text;
      changeCount++;
      return;
    }

    if (text.length > MAX_CHAR_COUNT) {
      // Still too long
      console.log(text);
      console.log(`\x1b[46m ${splat(trimmed)} \x1b[0m`);
    }
  });
}

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);

function splat(text) {
  const middlePoint = Math.floor(text.length / 2);
  const whitespaceIndices = /\s/;
  return middlePoint;
}
