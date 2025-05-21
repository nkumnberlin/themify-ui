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

    // Add import statement if it doesn't already exist
    const importStatement = `import ${componentName} from '@suggestions/${componentName}';\n`;
    if (!content.includes(importStatement)) {
      content = importStatement + content;
    }

    // Replace the existing render logic with the new component
    const renderRegex = /<[^>]+><\/[^>]+>/;
    content = content.replace(renderRegex, `<${componentName} />`);

    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, "utf8");

    return `code-renderer.tsx updated to include ${componentName}.`;
  },
  {
    name: "update_code_renderer",
    description: "Updates code-renderer.tsx to render the specified component.",
    schema: z.object({
      componentName: z.string().describe("The name of the component to render"),
    }),
  },
);

export const tools = [saveComponentTool, updateCodeRendererTool];
