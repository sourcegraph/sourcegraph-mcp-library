import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/scenarios");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts");

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes("prompts:")) continue;

  const promptMatch = content.match(
    /prompt:\s*\n\s*"((?:[^"\\]|\\.)*)"/,
  );
  if (!promptMatch) {
    console.warn(`Skip ${file}: no prompt found`);
    continue;
  }
  const promptText = promptMatch[1];
  const label =
    promptText.length > 48 ? `${promptText.slice(0, 45)}…` : promptText;

  content = content.replace(
    /prompt:\s*\n\s*"(?:[^"\\]|\\.)*",\s*\n\s*withoutMCP:/,
    `prompts: [
    {
      id: "primary",
      label: ${JSON.stringify(label)},
      text: ${JSON.stringify(promptText)},
      withoutMCP:`,
  );

  content = content.replace(
    /(\s+withMCP: \[[\s\S]*?\n\s+\]),\n\};/,
    "$1,\n    },\n  ],\n};",
  );

  fs.writeFileSync(filePath, content);
  console.log(`Migrated ${file}`);
}
