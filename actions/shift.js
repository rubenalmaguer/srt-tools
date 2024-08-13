/**
 * CONTENT SHIFT:
 * Timecodes stay the same but their text content is either
 * - pushed, or
 * - pulled
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

  // MEAT ==================
  const idRange = [23, 31];
  const indexRange = idRange.map((id) => id - 1);
  const [first, last] = indexRange;

  for (let i = first; i <= last; i++) {
    const nextText = i === last ? "" : cues[i + 1].data.text;
    cues[i].data.text = nextText;
  }

  const outputContent = stringifySync(cues, { format: "srt" });
  fs.writeFileSync(`${OUT}/${fileName}`, outputContent);

  console.log(
    `\x1b[36mShifted cues from id ${idRange[0]} to ${idRange[1]}:\x1b[0m`
  );
}

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);
