import { JsxElement, JsxSelfClosingElement, Node, Project } from "ts-morph";
import fs from "fs";

// ---- CONFIG: list the same file paths you previously annotated ----
const config = {
  paths: [
    "./components/testing/waitlist.tsx",
    "./components/suggestions/InputDisplay.tsx", // Add your file paths here
    "./components/suggestions/InputField.tsx", // Add your file paths here
    "./components/suggestions/LeadsDashboard.tsx", // Add your file paths here
  ],
  projectRoot: process.cwd(),
};
// -------------------------------------------------------------------

/**
 * Remove the `data-block-id` attribute from a single JSX element (opening tag).
 * Returns true if an attribute was actually removed.
 */
function removeDataAttribute(
  element: JsxElement | JsxSelfClosingElement,
): boolean {
  // For a <JsxElement> we want the opening element; for a <JsxSelfClosingElement> itself is the opening.
  const opening = Node.isJsxElement(element)
    ? element.getOpeningElement()
    : element;

  const attr = opening.getAttribute("data-block-id");
  if (attr) {
    attr.remove();
    return true;
  }
  return false;
}

/**
 * Walks the entire AST under `node` and removes any `data-block-id` it finds.
 * Returns true if anything was removed anywhere in this subtree.
 */
function traverseAndRemove(node: Node): boolean {
  let changed = false;

  node.forEachDescendant((descendant) => {
    if (
      Node.isJsxElement(descendant) ||
      Node.isJsxSelfClosingElement(descendant)
    ) {
      if (removeDataAttribute(descendant)) {
        changed = true;
      }
    }
  });

  return changed;
}

/**
 * For a given file path, load it into ts-morph, remove all data-block-id attributes,
 * and save if anything changed.
 */
function processFile(filePath: string, projectRoot: string): boolean {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  let changed = false;

  // Simply traverse the entire file looking for any JSX element to strip
  if (traverseAndRemove(sourceFile)) {
    sourceFile.saveSync();
    changed = true;
  }

  return changed;
}

function main() {
  for (const filePath of config.paths) {
    if (!fs.existsSync(filePath) || !filePath.endsWith(".tsx")) {
      console.log(`Skipping ${filePath} (not found or not a .tsx file)`);
      continue;
    }

    const removed = processFile(filePath, config.projectRoot);
    if (removed) {
      console.log(`Removed data-block-id from ${filePath}`);
    } else {
      console.log(`No data-block-id attributes found in ${filePath}`);
    }
  }
}

main();
