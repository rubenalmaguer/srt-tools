/**
 * TODO: Actually save to file
 */

import fs from "fs";
import { parseSync, stringifySync } from "subtitle";

const [IN, OUT] = process.argv.slice(-2);

const MAX_CHAR_COUNT = 30;

const allFileNames = fs.readdirSync(IN);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

if (!validFileNames.length) {
  console.log(`\x1b[31m No files to process. \x1b[0m`);
  process.exit();
}

let stillTooLong = 0;
for (let [fileNumber, fileName] of Object.entries(validFileNames)) {
  const rawContent = fs.readFileSync(`${IN}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");

  let changeCount = 0; // If > 0, write new file w/changes
  cues.forEach((cue, id) => {
    // Already short enuogh?
    let text = cue.data.text;
    if (text.length <= MAX_CHAR_COUNT) return;

    // Maybe just too many spaces?
    text = text.trim().replaceAll(/\s+/g, " ");
    if (text.length <= MAX_CHAR_COUNT) {
      cue.data.text = text;
      changeCount++;
      return;
    }

    // Still too long
    stillTooLong++;
    console.log(`\x1b[36m\x1b[44m ${fileNumber} - ${id} \x1b[0m`);

    console.log(text);

    if (text.length < MAX_CHAR_COUNT * 2) {
      // Split in only two
      // Aim for more balanced segements
      const breakpoint = getMiddlestSpace(text);
      console.log(`\x1b[46m${text.slice(0, breakpoint)}\x1b[0m`);
      console.log(`\x1b[46m${text.slice(breakpoint + 1)}\x1b[0m`);
    } else {
      // Split in more than two
      // As close as possible to max as many times as needed
      let segments = bruteSplit(text, MAX_CHAR_COUNT);
      console.log(`\x1b[41m${segments.join("\n")}\x1b[0m`);
    }

    console.log("\n");
  });
}

console.log(`\x1b[43m DONE \x1b[0m`);
console.log(`\x1b[43m Bad segments: ${stillTooLong} \x1b[0m`);

// TODO: Remove commas at end of segments (and consider the change in length when splitting)

function getMiddlestSpace(s) {
  const mid = Math.floor((s.length - 1) / 2); // Subtract space that will be removed
  if (s[mid] === " ") return mid;

  let current = 0;
  const rx = /\s/dg;
  let match;
  while ((match = rx.exec(s))) {
    const i = match.indices[0][0];
    if (i > mid) {
      // First larger than mid.
      // Is it closer to mid than previous?
      if (i - mid < mid - current) {
        current = i;
      }
      break;
    }

    current = i;
  }

  return current;
}

function bruteSplit(s, max) {
  let resultSegments = [];
  const words = s.split(" ");

  let segment = [];
  let length = 0;
  words.forEach((w) => {
    if (length + 1 + w.length > max) {
      resultSegments.push(segment.join(" "));
      segment = [w];
      length = w.length;
      return;
    }

    segment.push(w);
    length += 1 + w.length;
  });

  resultSegments.push(segment.join(" "));

  return resultSegments;
}

function testMiddlest() {
  const lucky = "12345 54321";
  const unlucky = "123 456 7 654 321";
  const sentence1 = "This is a sample sentence.";
  const sentence2 = "Sample sentence this is a.";

  console.log(getMiddlestSpace(lucky));
  console.log(getMiddlestSpace(unlucky));
  console.log(getMiddlestSpace(sentence1));
  console.log(getMiddlestSpace(sentence2));
}
