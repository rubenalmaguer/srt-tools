// Get this file's path (__dirname only available in CommonJS)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Actual script
import fs from "fs";
import { parseSync, stringifySync } from "subtitle";

//const INPUT_DIR_NAME = `W:/F/V/Spoon Radio/ES/no-br`;
const INPUT_DIR_NAME = `${__dirname}/input`;
const OUTPUT_DIR_NAME = `${__dirname}/output`;

const MAX_CHAR_COUNT = 30;

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

  let changeCount = 0; // If > 0, write new file w/changes
  cues.forEach((cue) => {
    // Already short enuogh?
    let text = cue.data.text;
    if (text.length < MAX_CHAR_COUNT) return;

    // Maybe just too many spaces?
    text = text.trim().replaceAll(/\s+/g, " ");
    if (text.length < MAX_CHAR_COUNT) {
      cue.data.text = text;
      changeCount++;
      return;
    }

    // Still too long
    if (text.length < MAX_CHAR_COUNT * 2) {
      console.log(text);
      const breakpoint = getMiddlestSpace(text);
      console.log(`\x1b[46m${text.slice(0, breakpoint)}\x1b[0m`);
      console.log(`\x1b[46m${text.slice(breakpoint + 1)}\x1b[0m`);
    } else {
      console.log(`\x1b[41m This needs 3 or more segments \x1b[0m`);
      console.log(text.length, text);
    }
  });
}

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);

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
