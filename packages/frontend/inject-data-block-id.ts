import { Node, Project, SourceFile, SyntaxKind } from "ts-morph";
import path from "path";
import fs from "fs";

// Config: Provide an array of absolute or relative file/directory paths.
const config = {
  paths: [
    "./components", // Directory
    "./components/testing/",
    // Add more as needed
  ],
  projectRoot: process.cwd(),
};

// Helper: Get relative file path for block id
function getRelativePath(filePath: string, root: string) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

// Helper: Safely add data-block-id attribute
function injectDataBlockIdOnRootJSX(
  sourceFile: SourceFile,
  projectRoot: string,
) {
  // Try to find the default export function or exported function/arrow function named as file
  const functions = sourceFile
    .getFunctions()
    .map((fn) => ({ fn, name: fn.getName() }))
    .concat(
      sourceFile
        .getVariableDeclarations()
        .filter((v) => v.isExported())
        .map((v) => {
          const init = v.getInitializer();
          if (init && Node.isArrowFunction(init)) {
            return { fn: init, name: v.getName() }; // Use variable name!
          }
          return null;
        })
        .filter(Boolean) as { fn: any; name: string }[],
    );

  let foundRoot = false;

  for (const { fn, name } of functions) {
    const body = fn.getBody && fn.getBody();
    if (!body) continue;
    // Find return statement
    const returnStmt = body.getFirstDescendantByKind(
      SyntaxKind.ReturnStatement,
    );
    if (returnStmt) {
      const jsx = returnStmt.getFirstDescendant(
        (d) => Node.isJsxElement(d) || Node.isJsxSelfClosingElement(d),
      );
      if (jsx && Node.isJsxElement(jsx)) {
        const opening = jsx.getOpeningElement();
        if (!opening.getAttribute("data-block-id")) {
          const relPath = getRelativePath(
            sourceFile.getFilePath(),
            projectRoot,
          );
          const compName = name || sourceFile.getBaseNameWithoutExtension();
          opening.addAttribute({
            name: "data-block-id",
            initializer: `"${relPath} ${compName}"`,
          });
          foundRoot = true;
        }
      }
      if (jsx && Node.isJsxSelfClosingElement(jsx)) {
        if (!jsx.getAttribute("data-block-id")) {
          const relPath = getRelativePath(
            sourceFile.getFilePath(),
            projectRoot,
          );
          const compName = name || sourceFile.getBaseNameWithoutExtension();
          jsx.addAttribute({
            name: "data-block-id",
            initializer: `"${relPath} ${compName}"`,
          });
          foundRoot = true;
        }
      }
    }
  }

  return foundRoot;
}

// Recursively walk directories and find .tsx files
function collectTsxFiles(entry: string): string[] {
  const abs = path.resolve(config.projectRoot, entry);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) {
    return abs.endsWith(".tsx") ? [abs] : [];
  }
  // Directory: walk recursively
  return fs.readdirSync(abs).flatMap((f) => collectTsxFiles(path.join(abs, f)));
}

// Main Script
function main() {
  const files = config.paths.flatMap(collectTsxFiles);
  const project = new Project();

  for (const filePath of files) {
    const sourceFile = project.addSourceFileAtPath(filePath);
    console.log(`Processing ${filePath}`);
    const changed = injectDataBlockIdOnRootJSX(sourceFile, config.projectRoot);
    if (changed) {
      sourceFile.saveSync();
      console.log(`!! Injected data-block-id in ${filePath}`);
    }
  }
}

main();
