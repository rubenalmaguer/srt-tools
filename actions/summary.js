import fs from "fs";
import path from "path";
import { parseSync } from "subtitle";
//import { gptSummarize } from "../../ask-pplx.js";

const [IN, OUT] = process.argv.slice(-2);

const FULL_TEXT_OUTPUT_FILE_NAME = "text_only.txt";
const SUMMARY_OUTPUT_FILE_NAME = "summary.txt";

const allFileNames = fs.readdirSync(IN);
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
  const rawContent = fs.readFileSync(`${IN}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");
  const texts = cues.map((cue) => cue.data.text);
  onlyText += texts.join("\n") + "\n"; // Plus line between files
}

fs.writeFileSync(path.join(OUT, FULL_TEXT_OUTPUT_FILE_NAME), onlyText);

console.log(`\x1b[32m Extraction complete. \x1b[0m`);

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
process.exit();

try {
  console.log("Summarizing...");
  const response = await gptSummarize(onlyText);
  const summary = response?.choices?.[0]?.message?.content;

  if (!summary?.length) {
    console.log(`\x1b[31m Empty summary. \x1b[0m`);
    process.exit();
  }

  fs.writeFileSync(`${OUT}/${SUMMARY_OUTPUT_FILE_NAME}`, summary);
  console.log(
    `\x1b[32m Done. summary saved at ${path.join(
      OUT,
      SUMMARY_OUTPUT_FILE_NAME
    )} \x1b[0m`
  );
} catch (e) {
  console.log(
    `\x1b[31m Something went wrong. Maybe try pasting "${FULL_TEXT_OUTPUT_FILE_NAME}" in a free online gpt? \x1b[0m`
  );
  throw e;
}
