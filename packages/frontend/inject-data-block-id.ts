import {
  Block,
  JsxElement,
  JsxSelfClosingElement,
  Node,
  Project,
} from "ts-morph";
import path from "path";
import fs from "fs";

// ---- CONFIG ----
const config = {
  paths: [
    "./components/suggestions/InputDisplay.tsx", // Add your file paths here
    "./components/suggestions/InputField.tsx", // Add your file paths here
    "./components/suggestions/LeadsDashboard.tsx", // Add your file paths here
  ],
  projectRoot: process.cwd(),
};
// ---- END CONFIG ----

function getRelativePath(filePath: string, root: string) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function getOpeningElement(element: JsxElement | JsxSelfClosingElement) {
  return Node.isJsxElement(element) ? element.getOpeningElement() : element;
}

function shouldAnnotate(opening: any): boolean {
  const tagName = opening.getTagNameNode().getText();
  const hasClassName = opening.getAttribute("className") !== undefined;
  const isCustomComponent = /^[A-Z]/.test(tagName);
  const isTargetTag = ["div", "section", "main"].includes(tagName);
  return (isTargetTag && hasClassName) || isCustomComponent;
}

function annotateJsxElement(
  element: JsxElement | JsxSelfClosingElement,
  relPath: string,
): boolean {
  const opening = getOpeningElement(element);
  if (!shouldAnnotate(opening) || opening.getAttribute("data-block-id")) {
    return false;
  }
  const line = opening.getStartLineNumber();
  opening.addAttribute({
    name: "data-block-id",
    initializer: `"${relPath} line=${line}"`,
  });
  return true;
}

function traverseAndAnnotate(node: Node, relPath: string): boolean {
  let changed = false;

  node.forEachDescendant((descendant) => {
    if (
      Node.isJsxElement(descendant) ||
      Node.isJsxSelfClosingElement(descendant)
    ) {
      const opening = getOpeningElement(descendant);
      const existingAttr = opening.getAttribute("data-block-id");
      const line = opening.getStartLineNumber();
      const newValue = `"${relPath} line=${line}"`;

      if (existingAttr && Node.isJsxAttribute(existingAttr)) {
        // Now that we know it's a JsxAttribute, we can safely call setInitializer
        existingAttr.setInitializer(newValue);
        changed = true;
      } else if (!existingAttr && shouldAnnotate(opening)) {
        opening.addAttribute({
          name: "data-block-id",
          initializer: newValue,
        });
        changed = true;
      }
    }
  });

  return changed;
}

function getFunctionBody(fn: Node): Block | undefined {
  if (
    Node.isFunctionDeclaration(fn) ||
    Node.isFunctionExpression(fn) ||
    Node.isArrowFunction(fn)
  ) {
    const body = fn.getBody();
    if (body && Node.isBlock(body)) {
      return body;
    }
  }
  return undefined;
}

function annotateFile(filePath: string, projectRoot: string): boolean {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  const relPath = getRelativePath(filePath, projectRoot);
  let changed = false;

  const functions = sourceFile.getFunctions().filter((fn) => fn.isExported());
  const defaultExport = sourceFile
    .getDefaultExportSymbol()
    ?.getDeclarations()[0];
  if (defaultExport && Node.isFunctionDeclaration(defaultExport)) {
    functions.push(defaultExport);
  }

  for (const fn of functions) {
    const body = getFunctionBody(fn);
    if (!body) continue;

    const returnStmt = body
      .getStatements()
      .find((stmt) => Node.isReturnStatement(stmt));
    if (!returnStmt || !Node.isReturnStatement(returnStmt)) continue;

    let expr = returnStmt.getExpression();
    if (!expr) continue;

    // Unwrap ParenthesizedExpression if present
    while (Node.isParenthesizedExpression(expr)) {
      expr = expr.getExpression();
    }

    if (Node.isJsxElement(expr) || Node.isJsxSelfClosingElement(expr)) {
      if (annotateJsxElement(expr, relPath)) {
        changed = true;
      }
      if (traverseAndAnnotate(expr, relPath)) {
        changed = true;
      }
    }
  }

  if (changed) {
    sourceFile.saveSync();
  }
  return changed;
}

function main() {
  const files = config.paths;
  for (const filePath of files) {
    if (!fs.existsSync(filePath) || !filePath.endsWith(".tsx")) continue;
    const changed = annotateFile(filePath, config.projectRoot);
    if (changed) {
      console.log(`Injected data-block-id in ${filePath}`);
    } else {
      console.log(`No annotation needed for ${filePath}`);
    }
  }
}

main();
