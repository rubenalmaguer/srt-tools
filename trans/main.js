// Get this file's path (__dirname only available in CommonJS)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Actual script
import fs from "fs";
import path from "path";
//import { gptTranslate } from "../ask-pplx.js";
import { gptTranslate } from "../ask-openai.js";

//const INPUT_DIR_NAME = `W:/F/V/Spoon Radio/ES/no-br`;
const INPUT_DIR_PATH = `${__dirname}/input`;
const OUTPUT_DIR_PATH = `${__dirname}/output`;

const allFileNames = fs.readdirSync(INPUT_DIR_PATH);
const supportedExtensions = ["srt", "vtt"];
const validFileNames = allFileNames.filter(
  (s) => !!supportedExtensions.includes(s.split(".").pop())
);

if (!validFileNames.length) {
  console.log(`\x1b[31m No files to process. \x1b[0m`);
  process.exit();
}

const promises = validFileNames.map(async (fileName) => {
  await new Promise((r) => setTimeout(r, 3000)); // WORKAROUND 429 TOO MANY REQUESTS
  const fileContent = fs.readFileSync(`${INPUT_DIR_PATH}/${fileName}`, "utf8");
  return gptTranslate(fileContent);
});

const results = await Promise.allSettled(promises);

results.forEach((result, index) => {
  if (result.status === "fulfilled") {
    const response = result.value;
    const translation = response?.choices?.[0]?.message?.content;

    console.log(`\x1b[36m Results for ${validFileNames[index]}:  \x1b[0m`);

    const baseName = path.basename(
      validFileNames[index],
      path.extname(validFileNames[index])
    );

    if (!!translation?.length) {
      //const saveName = baseName + "_pplx.srt";
      const saveName = baseName + "_gpt4.srt";
      const savePath = path.join(OUTPUT_DIR_PATH, saveName);

      const fixedTranslation = postProcess(translation);

      fs.writeFileSync(savePath, fixedTranslation);
      console.log(`\x1b[32m Translation saved at ${savePath} \x1b[0m`);
    } else {
      console.log(`\x1b[31m Empty translation. (${baseName}) \x1b[0m`);
    }
  } else {
    console.error(
      `Error fetching data from ${validFileNames[index]}:`,
      result.reason
    );
  }
});

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);

function postProcess(translation) {
  // Fix literal line breaks
  // Remove preamble
  // Remove trailing lonely quote
  return translation
    .replaceAll("\\r", "\r")
    .replaceAll("\\n", "\n")
    .replace(/^\D+/, "")
    .replace(/\n"$/, "");
}
