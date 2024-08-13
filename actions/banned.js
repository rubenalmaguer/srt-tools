import fs from "fs";
import { parseSync, formatTimestamp } from "subtitle";

const [IN, OUT] = process.argv.slice(-2);
const INPUT_FILE_PATH = `./actions/banned-words.txt`;

const allFileNames = fs.readdirSync(IN);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

const bannedWords = readWordsFromFile(INPUT_FILE_PATH);

if (!bannedWords?.length) {
  console.log(`\x1b[31m There are no banned words. \x1b[0m`);
  process.exit();
} else {
  console.log(
    `\x1b[45m Banned words (${bannedWords.length}): ${bannedWords} \x1b[0m\n`
  );
}

const bannedRegex = new RegExp("\\b(?:" + bannedWords.join("|") + ")\\b", "gi");

let found = [];
for (let fileName of validFileNames) {
  const rawContent = fs.readFileSync(`${IN}/${fileName}`, "utf8");
  const parsedContent = parseSync(rawContent);
  const cues = parsedContent.filter((line) => line.type === "cue");

  let result = {
    fileName,
    badCues: [],
  };

  cues.forEach((cue) => {
    if (bannedRegex.test(cue.data.text)) {
      result.badCues.push({
        ts: formatTimestamp(cue.data.start),
        text: cue.data.text,
        matches: cue.data.text.match(bannedRegex),
      });
    }
  });

  if (result.badCues.length) found.push(result);
}

if (!found.length) {
  console.log(`\x1b[42m No banned terms found. \x1b[0m`);
} else {
  console.log(
    `\x1b[41m Banned words found in these files (${found.length}): \x1b[0m`
  );
  console.log(`\x1b[31m ${JSON.stringify(found, null, 2)} \x1b[0m`);
}

function readWordsFromFile(filename) {
  try {
    const data = fs.readFileSync(filename, "utf8");
    const wordsArray = data
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word !== "");

    return wordsArray;
  } catch (err) {
    console.error("Error reading file:", err);
    throw err; // Re-throw the error to handle it where the function is called
  }
}
