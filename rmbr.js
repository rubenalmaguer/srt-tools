import fs from "fs";
import { parseSync, stringifySync } from "subtitle";

const INPUT_DIR_NAME = "./input";
const OUTPUT_DIR_NAME = "./output";

const allFileNames = fs.readdirSync(INPUT_DIR_NAME);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

for (let fileName of validFileNames) {
  const rawContent = fs.readFileSync(`${INPUT_DIR_NAME}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");

  cues.forEach((cue, i) => {
    // First cue includes episode title in first line. Skip that one.
    if (i < 1) return;
    cue.data.text = cue.data.text.replaceAll(/\s*(\r?\n)+\s*/g, " ");
  });

  console.log(`\x1b[36m WRITING OUTPUT:  ${fileName} \x1b[0m`);

  const outputContent = stringifySync(cues, { format: "srt" });
  fs.writeFileSync(`./${OUTPUT_DIR_NAME}/${fileName}`, outputContent);
}
