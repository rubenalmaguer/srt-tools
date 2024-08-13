/**
 * SPLIT SOFT ?
 * Split wherever there already is a manual <br>
 */

import fs from "fs";
import { parseSync, stringifySync } from "subtitle";

const [IN, OUT] = process.argv.slice(-2);

const MIN_GAP_MS = 42; // 1 frame at 23.976 frame rate

const allFileNames = fs.readdirSync(IN);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

if (!validFileNames.length) {
  console.log(`\x1b[31m No files to process. \x1b[0m`);
  process.exit();
}

for (let [_fileNumber, fileName] of Object.entries(validFileNames)) {
  const rawContent = fs.readFileSync(`${IN}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");

  let newCues = [];

  const linebreakRegex = /(?<!\])(?:\r?\n)+(?!- )/g; // Except when followed by "- dialog style" or preceded by "[on screen text]"

  cues.forEach((cue, _id) => {
    // Already short enuogh?
    const text = cue.data.text;
    const lines = text.split(linebreakRegex);

    // No breaks
    if (lines.length < 2) {
      newCues.push(cue);
      return;
    }

    // Distribute time equally for each line's characters
    let availableTime = cue.data.end - cue.data.start;
    const gapsSum = MIN_GAP_MS * (lines.length - 1);
    availableTime = availableTime - gapsSum;

    let usedUpTime = 0;
    const fullLength = lines.reduce((a, c) => a + c.length, 0);
    lines.forEach((line) => {
      const ratio = line.length / fullLength;
      const duration = Math.floor(ratio * availableTime);

      newCues.push({
        type: "cue",
        data: {
          start: cue.data.start + usedUpTime,
          end: cue.data.start + usedUpTime + duration,
          text: line,
        },
      });

      usedUpTime += duration + MIN_GAP_MS;
    });
  });

  console.log(`\x1b[36m WRITING OUTPUT:  ${fileName} \x1b[0m`);
  const outputContent = stringifySync(newCues, { format: "srt" });
  fs.writeFileSync(`${OUT}/${fileName}`, outputContent);
}

console.log(`\x1b[43m DONE \x1b[0m`);
