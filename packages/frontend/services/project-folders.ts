import fs from "fs";
import path from "path";

type GroupedProjectEntries = Record<
  string,
  { path: string; isFolder: boolean }[]
>;

export function getGroupedProjectEntries() {
  const projectRoot = process.cwd();
  const grouped: GroupedProjectEntries = {};

  function walk(dir: string, base: string = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(base, entry.name);
      const displayPath = `@${relativePath}${entry.isDirectory() ? "/" : ""}`;

      const topGroup = relativePath.split("/")[0];
      if (!grouped[topGroup]) grouped[topGroup] = [];

      grouped[topGroup].push({
        path: displayPath,
        isFolder: entry.isDirectory(),
      });

      if (entry.isDirectory()) {
        walk(fullPath, relativePath);
      }
    }
  }

  walk(projectRoot);

  return grouped as GroupedProjectEntries satisfies GroupedProjectEntries;
}
