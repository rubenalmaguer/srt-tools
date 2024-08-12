// Get this file's path (__dirname only available in CommonJS)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Actual script
/**
 * Does NOT split.
 * Literally only removes line breaks
 */
import fs from "fs";
import { parseSync, stringifySync } from "subtitle";

//const INPUT_DIR_NAME = `W:/F/V/Spoon Radio/ES/no-br`;
const INPUT_DIR_NAME = `${__dirname}/input`;
const OUTPUT_DIR_NAME = `${__dirname}/output`;

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

  // A line break, MAYBE surrounded by spaces,
  // but NOT preceded by parentheses/brackets,
  // and NOT followed by hyphen (multi-speaker dialog style)
  // It matches against the text itself. No need to worry about breaks between cues.
  const rx = /(?<![\)\]])\s*(\r?\n)+\s*(?!-)/g;
  cues.forEach((cue) => {
    cue.data.text = cue.data.text.replaceAll(rx, " ");
  });

  console.log(`\x1b[36m WRITING OUTPUT:  ${fileName} \x1b[0m`);

  const outputContent = stringifySync(cues, { format: "srt" });
  fs.writeFileSync(`${OUTPUT_DIR_NAME}/${fileName}`, outputContent);
}

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);
