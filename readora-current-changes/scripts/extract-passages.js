import fs from "node:fs";
import { createHash } from "node:crypto";

const raw = fs.readFileSync(new URL("../content/sources/pg21.txt", import.meta.url), "utf8");
const lines = raw.split(/\r?\n/);
const selections = [
  ["lion-mouse", "The Lion And The Mouse", 880, 891, "It happened shortly after this"],
  ["hare-tortoise", "The Hare and the Tortoise", 1052, 1063, "On the day appointed"],
  ["crow-pitcher", "The Crow and the Pitcher", 3968, 3976, "At last he collected"],
  ["fox-crow", "The Fox and the Crow", 2432, 2441, "This he said deceitfully;"],
  ["ants-grasshopper", "The Ants and the Grasshopper", 1038, 1044, "He replied,"],
  ["oak-reeds", "The Oak and the Reeds", 2975, 2982, "They replied,"],
  ["north-wind-sun", "The North Wind and the Sun", 4827, 4838, "The Sun suddenly shone out"],
];
const normalize = (s) => s.replace(/\s+/g, " ").trim();
const passages = selections.map(([id, title, startLine, endLine, split]) => {
  const text = lines.slice(startLine - 1, endLine).join("\n").trim()
    .split(/\n\s*\n/).map(normalize).join("\n\n");
  const at = text.indexOf(split);
  if (at < 1 || !raw.includes(title)) throw Error(`Source boundary missing: ${id}`);
  return { id, title, startLine, endLine, sections: [text.slice(0, at).trim(), text.slice(at).trim()] };
});
fs.writeFileSync(new URL("../content/passages.json", import.meta.url), JSON.stringify({
  work: "Three hundred Aesop’s fables",
  author: "Aesop",
  translator: "George Fyler Townsend (1814–1900)",
  sourceUrl: "https://www.gutenberg.org/ebooks/21",
  retrieved: "2026-10-05",
  sha256: createHash("sha256").update(raw).digest("hex"),
  changes: "Whitespace normalized and passages split into two sections; wording and punctuation preserved.",
  passages,
}, null, 2) + "\n");
// Retain the full source and its included license for inspection/download.
fs.mkdirSync(new URL("../public/sources/", import.meta.url), { recursive: true });
fs.copyFileSync(new URL("../content/sources/pg21.txt", import.meta.url), new URL("../public/sources/pg21.txt", import.meta.url));
