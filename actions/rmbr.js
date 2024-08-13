/**
 * Does NOT split.
 * Only replaces breaks with spaces, unless preceeded by brackets, etc.
 */

import fs from "fs";
import { parseSync, stringifySync } from "subtitle";

const [IN, OUT] = process.argv.slice(-2);

const allFileNames = fs.readdirSync(IN);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

if (!validFileNames.length) {
  console.log(`\x1b[31m No files to process. \x1b[0m`);
  process.exit();
}

for (let fileName of validFileNames) {
  const rawContent = fs.readFileSync(`${IN}/${fileName}`, "utf8");
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
  fs.writeFileSync(`${OUT}/${fileName}`, outputContent);
}

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);
