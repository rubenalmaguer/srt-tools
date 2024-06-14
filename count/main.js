// Get this file's path (__dirname only available in CommonJS)
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Actual script
import { parseSync } from 'subtitle';
import fs from 'fs';

const INPUT_DIR_NAME = `${__dirname}/input`
const fileNames = fs.readdirSync(INPUT_DIR_NAME)

const sortNaturally = (names) => {
  return names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}
const sortedFileNames = sortNaturally(fileNames);
const supportExtensions = ['srt', 'vtt']

let totalWordCount = 0

for (let fileName of sortedFileNames) {
  if (!supportExtensions.includes(fileName.split('.').pop())) continue

  let singleFileWordCount = 0

  const rawContent = fs.readFileSync(`${INPUT_DIR_NAME}/${fileName}`, 'utf8')
  const parsedContent = parseSync(rawContent)
  const cues = parsedContent.filter(line => line.type === 'cue')

  cues.forEach(cue => {
    const text = cue.data.text
    const countWords = (s) => /^\s*$/.test(s) ? 0 : [...s.trim().matchAll(/\s+/g)].length + 1;
    singleFileWordCount += countWords(text)
  })

  console.log(`\x1b[36m${fileName}\x1b[0m`);
  console.log(singleFileWordCount);

  totalWordCount += singleFileWordCount
}

console.log(`\x1b[32m\x1b[40m============\x1b[0m`);
console.log(`\x1b[32m\x1b[43m ${totalWordCount} \x1b[0m`);