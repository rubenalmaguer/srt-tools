// Get this file's path (__dirname only available in CommonJS)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Actual script
import fs from "fs";
import { parseSync } from "subtitle";
import { Parser } from "my-srt-parser";

const INPUT_DIR_NAME = `${__dirname}/input`;

const allFileNames = fs.readdirSync(INPUT_DIR_NAME);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

const parser = new Parser(); // ONLY for ms -> timestamp conversion

let found = [];
const bannedRegex = /Teyong|Taeyoung|Heyoung|Haeyoung/gi;

for (let fileName of validFileNames) {
  const rawContent = fs.readFileSync(`${INPUT_DIR_NAME}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");

  let result = {
    fileName,
    badCues: [],
  };

  cues.forEach((cue) => {
    if (bannedRegex.test(cue.data.text)) {
      result.badCues.push({
        ts: parser.millisecondsToTimestamp(cue.data.start),
        text: cue.data.text,
      });
    }
  });

  if (result.badCues.length) found.push(result);
}

if (!found.length) {
  console.log(`\x1b[32m No banned terms found. \x1b[0m`);
} else {
  console.log(
    `\x1b[41m Banned words found in these files (${found.length}): \x1b[0m`
  );
  console.log(`\x1b[31m ${JSON.stringify(found, null, 2)} \x1b[0m`);

  console.log(parser.millisecondsToTimestamp(1000));
}
