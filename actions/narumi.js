import fs from "fs";

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
  const outputContent = rawContent.replaceAll(/^```(?:plaintext)?/g, "");

  console.log(`\x1b[36m WRITING OUTPUT:  ${fileName} \x1b[0m`);

  fs.writeFileSync(`${OUT}/${fileName}`, outputContent);
}

console.log(`\x1b[30m\x1b[42m DONE \x1b[0m`);
