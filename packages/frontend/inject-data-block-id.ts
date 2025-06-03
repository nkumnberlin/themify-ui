import { Node, Project, SyntaxKind } from "ts-morph";
import path from "path";
import fs from "fs";

// ---- CONFIG ----
const config = {
  paths: [
    "./components/suggestions/InputField.tsx", // Your file here
    "./components/suggestions/InputDisplay.tsx", // Your file here
  ],
  projectRoot: process.cwd(),
};
// ---- END CONFIG ----
function getFunctionBody(fn: Node) {
  if (
    Node.isFunctionDeclaration(fn) ||
    Node.isFunctionExpression(fn) ||
    Node.isArrowFunction(fn)
  ) {
    return fn.getBody();
  }
  return undefined;
}

function getRootReturn(body: Node) {
  if (body.getKind() === SyntaxKind.Block) {
    // Typecast to get getStatements()
    // @ts-ignore
    const stmts = body.getStatements?.() || [];
    return stmts.find(
      (stmt: Node) => stmt.getKind() === SyntaxKind.ReturnStatement,
    );
  } else if (body.getKind() === SyntaxKind.ReturnStatement) {
    return body;
  }
  return undefined;
}

function getRelativePath(filePath: string, root: string) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}
function getOpening(element: any) {
  if (Node.isJsxElement(element)) {
    return element.getOpeningElement();
  } else if (Node.isJsxSelfClosingElement(element)) {
    return element;
  }
  return undefined;
}

function annotateRootReturnedJsx(filePath: string, projectRoot: string) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  const fn =
    sourceFile.getFunctions().find((f) => f.isExported()) ||
    sourceFile.getDefaultExportSymbol()?.getDeclarations()[0];

  if (!fn) return false;

  const body = getFunctionBody(fn);
  if (!body) return false;

  const rootReturn = getRootReturn(body);
  if (!rootReturn) return false;

  let jsx = rootReturn.getExpression();
  if (!jsx) return false;

  // Unwrap ParenthesizedExpression if present
  if (Node.isParenthesizedExpression(jsx)) {
    jsx = jsx.getExpression();
  }

  if (Node.isJsxElement(jsx) || Node.isJsxSelfClosingElement(jsx)) {
    const opening = getOpening(jsx);
    if (!opening) return false;
    const tag = opening.getTagNameNode().getText();
    const hasClassName = opening.getAttribute("className");

    if (
      (["main", "section", "div"].includes(tag) || hasClassName) &&
      !opening.getAttribute("data-block-id")
    ) {
      const relPath = getRelativePath(filePath, projectRoot);
      const line = opening.getStartLineNumber();
      opening.addAttribute({
        name: "data-block-id",
        initializer: `"${relPath} line:${line}"`,
      });
      sourceFile.saveSync();
      return true;
    }
  }
  return false;
}

function main() {
  const files = config.paths;
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    if (!filePath.endsWith(".tsx")) continue;
    const changed = annotateRootReturnedJsx(filePath, config.projectRoot);
    if (changed) {
      console.log(`Injected data-block-id in ${filePath}`);
    } else {
      console.log(`No annotation needed for ${filePath}`);
    }
  }
}

main();
