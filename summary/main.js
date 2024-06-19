// Get this file's path (__dirname only available in CommonJS)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Actual script
import fs from "fs";
import { parseSync } from "subtitle";
import { gptSummarize } from "./ask-pplx.js";

//const INPUT_DIR_NAME = `W:/F/V/Spoon Radio/ES/no-br`;
const INPUT_DIR_PATH = `${__dirname}/input`;
const OUTPUT_DIR_PATH = `${__dirname}/output`;
const FULL_TEXT_OUTPUT_FILE_NAME = "text_only.txt";
const SUMMARY_OUTPUT_FILE_NAME = "summary.txt";

const allFileNames = fs.readdirSync(INPUT_DIR_PATH);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

if (!validFileNames.length) {
  console.log(`\x1b[31m No files to process. \x1b[0m`);
  process.exit();
}

let onlyText = "";
// Remove time codes and ids
console.log("Extracting text...");

for (let fileName of validFileNames) {
  const rawContent = fs.readFileSync(`${INPUT_DIR_PATH}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");
  const texts = cues.map((cue) => cue.data.text);
  onlyText += texts.join("\n") + "\n"; // Plus line between files
}

fs.writeFileSync(`${OUTPUT_DIR_PATH}/${FULL_TEXT_OUTPUT_FILE_NAME}`, onlyText);

console.log(`\x1b[32m Extraction complete. \x1b[0m`);

try {
  console.log("Summarizing...");
  const summary = await gptSummarize(onlyText);
  const strSummary = JSON.stringify(summary);

  if (!summary?.length) {
    console.log(`\x1b[31m Empty summary. \x1b[0m`);

    process.exit();
  }

  fs.writeFileSync(
    `${OUTPUT_DIR_PATH}/${SUMMARY_OUTPUT_FILE_NAME}`,
    strSummary
  );
  console.log(
    `\x1b[32m Done. summary saved at ${OUTPUT_DIR_PATH}/${SUMMARY_OUTPUT_FILE_NAME} \x1b[0m`
  );
} catch (e) {
  console.log(
    `\x1b[31m Something went wrong. Maybe try pasting "${FULL_TEXT_OUTPUT_FILE_NAME}" in a free online gpt? \x1b[0m`
  );
  throw e;
}
