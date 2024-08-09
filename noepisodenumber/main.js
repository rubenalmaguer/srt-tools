// Get this file's path (__dirname only available in CommonJS)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Actual script
import fs from "fs";
import { parseSync, stringifySync } from "subtitle";

const INPUT_DIR_NAME = String.raw`
\\192.168.1.213\l10n\Prj\스푼라디오\스푼라디오_240620_014_내남자의남자친구_KO2multi\06_Delivery\en
`.trim();

//const INPUT_DIR_NAME = `${__dirname}/input`;

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

  let newCues = [];
  cues.forEach((cue) => {
    const before = cue.data.text;
    const after = before
      .replaceAll(/^\[\s*(Episodio|EPISODIO|Episode|EPISODE)\s+\d+\]/g, "")
      .trim();

    if (before !== after) {
      console.log(`\x1b[45m ${before} \x1b[0m`);

      if (!after) {
        console.log(`\x1b[44m EMPTY \x1b[0m`);
        // EMPTY CUE, don't push it
        return;
      } else {
        console.log(after);
        console.log("");
      }
    }

    // No changes
    cue.data.text = after;
    newCues.push(cue);
  });

  console.log(`\x1b[36m WRITING OUTPUT:  ${fileName} \x1b[0m`);
  const outputContent = stringifySync(newCues, { format: "srt" });
  fs.writeFileSync(`${OUTPUT_DIR_NAME}/${fileName}`, outputContent);
}

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);
