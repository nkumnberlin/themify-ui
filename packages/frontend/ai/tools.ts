import { tool } from "@langchain/core/tools";
import fs from "fs";
import path from "path";
import { z } from "zod";

const saveComponentTool = tool(
  async ({
    componentName,
    componentCode,
  }: {
    componentName: string;
    componentCode: string;
  }) => {
    const dir = path.join(process.cwd(), "components", "suggestions");
    const filePath = path.join(dir, `${componentName}.tsx`);

    // Ensure the directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the component code to the file
    fs.writeFileSync(filePath, componentCode, "utf8");

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

const updateCodeRendererTool = tool(
  async ({ componentName }: { componentName: string }) => {
    const filePath = path.join(
      process.cwd(),
      "components",
      "code-renderer.tsx",
    );
    let content = fs.readFileSync(filePath, "utf8");

    // 1. Add import if missing, inserting after the last import
    const importStatement = `import ${componentName} from '@suggestions/${componentName}';`;
    const importRegex = new RegExp(
      `import\\s+${componentName}\\s+from\\s+['"]@suggestions/${componentName}['"];?`,
    );
    if (!importRegex.test(content)) {
      // find all import statements
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
        // no imports at all
        content = importStatement + "\n\n" + content;
      }
    }

    // 2. Replace inner contents of the first JSX fragment in the return
    const fragmentRegex = /(return\s*\(\s*<>\s*)([\s\S]*?)(\s*<\/>\s*\);)/m;
    if (!fragmentRegex.test(content)) {
      throw new Error(
        "Could not find a JSX fragment in the return of code-renderer.tsx",
      );
    }
    content = content.replace(fragmentRegex, `$1<${componentName} />$3`);

    // 3. Write back
    fs.writeFileSync(filePath, content, "utf8");
    return `code-renderer.tsx updated to render <${componentName} />.`;
  },
  {
    name: "update_code_renderer",
    description:
      "Updates code-renderer.tsx to render the specified component inside the first JSX fragment.",
    schema: z.object({
      componentName: z.string().describe("The name of the component to render"),
    }),
  },
);

export const tools = [saveComponentTool, updateCodeRendererTool];
