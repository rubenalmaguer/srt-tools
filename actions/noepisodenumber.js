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
  fs.writeFileSync(`${OUT}/${fileName}`, outputContent);
}

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);
