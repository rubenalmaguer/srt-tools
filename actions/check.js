import fs from "fs";
import { parseSync } from "subtitle";

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

console.log(`\x1b[44m\nCHECKING ${IN}\x1b[0m`);

let failedFailcount = 0;
for (let fileName of validFileNames) {
  const rawContent = fs.readFileSync(`${IN}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");

  const badBreakRx = /(?<!\])(\r?\n)+(?!-)/;
  const badPunctuation = /([^\.]\.|,)$/m;
  let badCueIndices = [];
  cues.forEach((cue, i) => {
    const text = cue.data.text;
    if (badBreakRx.test(text) || badPunctuation.test(text))
      badCueIndices.push(cue, i);
  });

  if (!!badCueIndices.length) {
    failedFailcount++;
    console.log(`\x1b[31m\n${fileName}\x1b[0m`);

    console.log(`\x1b[41m FAIL \x1b[0m`);

    const badInfo = cues
      .filter((_cue, i) => badCueIndices.includes(i))
      .map((q) => JSON.stringify(q, null, 2));

    console.log(`\x1b[35m${badInfo}\x1b[0m`);
  }
}

console.log(`\x1b[47m\n DONE. Failed files: ${failedFailcount} \x1b[0m`);
