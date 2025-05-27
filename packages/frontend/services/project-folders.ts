import fs from "fs";
import path from "path";

export function getGroupedProjectFolders() {
  const projectRoot = process.cwd();
  const suggestions: string[] = [];

  function walk(dir: string, base: string = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(base, entry.name);

      if (entry.isDirectory()) {
        suggestions.push(`@${relativePath}/`);
        walk(fullPath, relativePath);
      }
    }
  }

  walk(projectRoot);

  const grouped: Record<string, string[]> = {};

  for (const suggestion of suggestions) {
    const parts = suggestion.split("/");
    const base = parts[0];
    if (!grouped[base]) grouped[base] = [];
    grouped[base].push(suggestion);
  }
  return grouped;
}
