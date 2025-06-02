import { tool } from "@langchain/core/tools";
import fs from "fs";
import path from "path";
import { z } from "zod";

export const saveComponentTool = tool(
  async ({
    componentName,
    componentCode,
  }: {
    componentName: string;
    componentCode: string;
  }) => {
    const dir = path.join(process.cwd(), "components", "suggestions");
    const filePath = path.join(dir, `${componentName}.tsx`);

    if (!fs.existsSync(dir)) {
      console.log("EXIST to:", filePath);

      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      console.log("Saving component to:", filePath);
      fs.writeFileSync(filePath, componentCode, "utf8");
    } catch (e) {
      console.error("Error writing file:", e);
    }
    return `Component ${componentName} saved successfully.`;
  },
  {
    name: "save_component",
    description: "Saves a React component to the suggestions directory.",
    schema: z.object({
      componentName: z.string().describe("The name of the component"),
      componentCode: z.string().describe("The code of the component"),
    }),
  },
);

export const updateCodeRendererTool = tool(
  async ({ componentName }: { componentName: string }) => {
    const filePath = path.join(
      process.cwd(),
      "components",
      "code-renderer.tsx",
    );
    let content = fs.readFileSync(filePath, "utf8");

    // 1. (Unchanged) Add import if missing
    const importStatement = `import ${componentName} from '@suggestions/${componentName}';`;
    const importRegex = new RegExp(
      `import\\s+${componentName}\\s+from\\s+['"]@suggestions/${componentName}['"];?`,
    );
    if (!importRegex.test(content)) {
      const importMatches = [...content.matchAll(/^import .+ from .+;$/gm)];
      if (importMatches.length) {
        const last = importMatches[importMatches.length - 1];
        const insertPos = last.index! + last[0].length;
        content =
          content.slice(0, insertPos) +
          "\n" +
          importStatement +
          content.slice(insertPos);
      } else {
        content = importStatement + "\n\n" + content;
      }
    }

    // 2. Find the <div id="code-renderer">…</div> and replace its inner HTML with <ComponentName/>
    const divRegex =
      /<div\s+id=["']code-renderer["']([^>]*)>([\s\S]*?)<\/div>/m;

    if (!divRegex.test(content)) {
      console.error(
        `Could not find <div id="code-renderer">…</div> inside ${filePath}.`,
      );
      console.log("Content of code-renderer.tsx was:\n", content);
      throw new Error(
        'Could not find <div id="code-renderer">…</div> in code-renderer.tsx',
      );
    }

    // Replace just the inner portion of that div
    content = content.replace(
      divRegex,
      `<div id="code-renderer"$1><${componentName} /></div>`,
    );

    // 3. Write the file back
    fs.writeFileSync(filePath, content, "utf8");
    return `code-renderer.tsx updated so that <${componentName}/> is inside the div#code-renderer.`;
  },
  {
    name: "update_code_renderer",
    description:
      'Updates code-renderer.tsx by injecting the specified component inside <div id="code-renderer">.',
    schema: z.object({
      componentName: z.string().describe("The name of the component to render"),
    }),
  },
);

export const readFilesTool = tool(
  async ({ filePaths }: { filePaths: string[] }) => {
    const results: Record<string, string> = {};
    console.log("Reading files:", filePaths);
    for (const relativePath of filePaths) {
      const absolutePath = path.join(process.cwd(), relativePath);
      try {
        const content = fs.readFileSync(absolutePath, "utf8");
        results[relativePath] = content;
      } catch (error) {
        results[relativePath] =
          `Error reading file: ${(error as Error).message}`;
      }
    }

    return results;
  },
  {
    name: "read_files",
    description: "Reads the contents of specified files from the project root.",
    schema: z.object({
      filePaths: z.array(z.string()).describe("List of file paths to read."),
    }),
  },
);

// Helper: attempt to resolve an import specifier to an actual file path on disk.
// Tries extensions [".tsx", ".ts", ".jsx", ".js"] and index files in case of folder imports.
function resolveImport(
  importSpecifier: string,
  fromDir: string,
): string | null {
  // Handle relative imports ("./Foo", "../Bar")
  if (importSpecifier.startsWith(".")) {
    const base = path.resolve(fromDir, importSpecifier);
    const candidates = [
      `${base}.tsx`,
      `${base}.ts`,
      `${base}.jsx`,
      `${base}.js`,
      path.join(base, "index.tsx"),
      path.join(base, "index.ts"),
      path.join(base, "index.jsx"),
      path.join(base, "index.js"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  // Handle alias-like imports (e.g. "@suggestions/InputDisplay")
  // In our codebase, "@suggestions/XYZ" → "<projectRoot>/components/suggestions/XYZ.tsx"
  if (importSpecifier.startsWith("@suggestions/")) {
    const rel = importSpecifier.replace("@suggestions/", "");
    const base = path.join(process.cwd(), "components", "suggestions", rel);
    const candidates = [
      `${base}.tsx`,
      `${base}.ts`,
      `${base}.jsx`,
      `${base}.js`,
      path.join(base, "index.tsx"),
      path.join(base, "index.ts"),
      path.join(base, "index.jsx"),
      path.join(base, "index.js"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  // You can add more alias resolution strategies here if needed.

  return null;
}

// Helper: extract all top-level import specifiers from a file's source text.
function parseImports(fileText: string): string[] {
  const importRegex = /import\s+[^'"]+['"](.+?)['"]/g;
  const matches: string[] = [];
  let m: RegExpExecArray | null = null;
  while ((m = importRegex.exec(fileText)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

export const findDataTagTool = tool(
  async ({
    startingComponentPath,
    dataTag,
  }: {
    startingComponentPath: string;
    dataTag: string;
  }) => {
    const visited = new Set<string>();

    // Recursively search for dataTag in file and its imports.
    async function recurse(filePath: string): Promise<string | null> {
      const absPath =
        filePath.startsWith("/") || filePath.startsWith(".")
          ? path.resolve(process.cwd(), filePath)
          : path.resolve(process.cwd(), filePath);

      if (visited.has(absPath)) {
        return null;
      }
      visited.add(absPath);

      if (!fs.existsSync(absPath)) {
        return null;
      }

      let contents: string;
      try {
        contents = fs.readFileSync(absPath, "utf8");
      } catch (err) {
        return null;
      }

      // Check if `dataTag` string appears anywhere in this file.
      if (contents.includes(dataTag)) {
        return contents;
      }

      // Otherwise, parse imports and recurse.
      const imports = parseImports(contents);
      const dir = path.dirname(absPath);
      for (const imp of imports) {
        const resolved = resolveImport(imp, dir);
        if (resolved) {
          const found = await recurse(resolved);
          if (found) {
            return found;
          }
        }
      }

      return null;
    }

    const result = await recurse(startingComponentPath);
    if (result) {
      return result;
    } else {
      return `Data tag "${dataTag}" not found in "${startingComponentPath}" or its imported components.`;
    }
  },
  {
    name: "find_data_tag",
    description:
      'Recursively searches a React component (and its imported subcomponents) for a given data-tag (e.g. data-block-id="..."). Returns the full file contents where the data-tag is found.',
    schema: z.object({
      startingComponentPath: z
        .string()
        .describe(
          "Relative path to the entry component file (e.g. './components/code-renderer.tsx').",
        ),
      dataTag: z
        .string()
        .describe(
          'Exact substring to search for, e.g. `data-block-id="someName"`.',
        ),
    }),
  },
);

export const updateFeedbackedComponentTool = tool(
  async ({
    filePath,
    componentCode,
  }: {
    filePath: string;
    componentCode: string;
  }) => {
    // Resolve the absolute path based on the project root
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    // Check if the file exists before attempting to overwrite it
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found at path: ${absolutePath}`);
    }

    // Optionally, you could insert a simple validation step here.
    // For example, you might run a TypeScript syntax check or a linter.
    // This example will skip that and simply overwrite the file.

    try {
      fs.writeFileSync(absolutePath, componentCode, "utf8");
      return `Component at '${filePath}' updated successfully.`;
    } catch (e) {
      console.error("Error writing file:", e);
      throw new Error(`Failed to update component at '${filePath}': ${e}`);
    }
  },
  {
    name: "update_feedback_component",
    description:
      "Looks up the provided file path, verifies the file exists, and overwrites it with the updated React component code.",
    schema: z.object({
      filePath: z
        .string()
        .describe(
          "The relative or absolute path to the component file (e.g., './components/InputDisplay.tsx').",
        ),
      componentCode: z
        .string()
        .describe(
          "The new code that should replace the existing contents of the file.",
        ),
    }),
  },
);
