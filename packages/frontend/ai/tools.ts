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
