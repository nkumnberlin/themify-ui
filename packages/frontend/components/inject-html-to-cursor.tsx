import React, { useCallback, useState } from "react";
import { Inspector } from "react-dev-inspector";

type ComponentInfo = {
  name: string;
  filePath: string;
  element: HTMLElement;
};

type InjectHtmlToCursorProps = {
  children: React.ReactNode;
  handleGranularUserFeedback: (data: {
    message: string;
    dataBlockId: string;
  }) => void;
};

type SourceInfo = {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
};

function extractSourceInfo(str: string): SourceInfo | null {
  const fileNameMatch = /fileName:\s*["']([^"']+)["']/m.exec(str);
  const lineNumberMatch = /lineNumber:\s*(\d+)/m.exec(str);
  const columnNumberMatch = /columnNumber:\s*(\d+)/m.exec(str);

  if (!fileNameMatch && !lineNumberMatch && !columnNumberMatch) return null;

  return {
    fileName: fileNameMatch?.[1],
    lineNumber: lineNumberMatch ? Number(lineNumberMatch[1]) : undefined,
    columnNumber: columnNumberMatch ? Number(columnNumberMatch[1]) : undefined,
  };
}

// Enhanced component detection with better element identification
export default function InjectHtmlToCursor({
  children,
  handleGranularUserFeedback,
}: InjectHtmlToCursorProps) {
  const [isSelectionMode, setSelectionMode] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null,
  );
  const [detectedComponent, setDetectedComponent] =
    useState<ComponentInfo | null>(null);

  // Enhanced element identification similar to v0
  const identifyElementAtCursor = useCallback((x: number, y: number) => {
    // Get element at point, excluding overlays
    const element = document.elementFromPoint(x, y) as HTMLElement;
    if (!element) return null;

    // Build element context for better identification
    const elementContext = {
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      textContent: element.textContent?.trim() || "",
      attributes: Array.from(element.attributes).reduce(
        (acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        },
        {} as Record<string, string>,
      ),
      boundingRect: element.getBoundingClientRect(),
      children: Array.from(element.children).map((child) => ({
        tagName: child.tagName.toLowerCase(),
        className: child.className,
      })),
    };

    return { element, context: elementContext };
  }, []);

  // Enhanced React component detection
  const detectReactComponent = useCallback((element: HTMLElement) => {
    // Get React Fiber
    const fiber = getReactFiberFromElement(element);
    if (!fiber) return null;

    // Walk up the fiber tree to find meaningful components
    let current = fiber;
    const componentChain = [];

    while (current) {
      if (current.type && typeof current.type === "function") {
        const componentName = current.type.name || current.type.displayName;

        if (componentName && !isBuiltInComponent(componentName)) {
          componentChain.push({
            name: componentName,
            fiber: current,
            props: current.memoizedProps,
            source: extractSourceInfo(current.elementType?.toString() || ""),
          });
        }
      }
      current = current.return;
    }

    return componentChain;
  }, []);

  // Check if component is a built-in React/HTML component
  const isBuiltInComponent = (name: string): boolean => {
    const builtIns = [
      "div",
      "span",
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "button",
      "input",
      "form",
      "img",
      "a",
      "ul",
      "ol",
      "li",
      "Fragment",
      "StrictMode",
      "Suspense",
      "_temp1",
      "_c",
    ];
    return (
      builtIns.includes(name) || name.startsWith("_") || name === "Unknown"
    );
  };

  // Enhanced element classification
  const classifyElement = useCallback((element: HTMLElement, fiber?: any) => {
    const classification = {
      isInteractive: false,
      isLayoutContainer: false,
      isContentBlock: false,
      semanticRole: "unknown",
      componentType: "unknown",
    };

    // Check if interactive
    const interactiveTags = ["button", "input", "select", "textarea", "a"];
    const hasClickHandler = element.onclick || element.getAttribute("onclick");
    classification.isInteractive =
      interactiveTags.includes(element.tagName.toLowerCase()) ||
      !!hasClickHandler ||
      element.getAttribute("role") === "button";

    // Check if layout container
    const style = window.getComputedStyle(element);
    classification.isLayoutContainer =
      style.display === "flex" ||
      style.display === "grid" ||
      element.children.length > 2;

    // Determine semantic role
    if (element.getAttribute("role")) {
      classification.semanticRole = element.getAttribute("role")!;
    } else if (element.tagName.toLowerCase() === "main") {
      classification.semanticRole = "main";
    } else if (element.tagName.toLowerCase() === "nav") {
      classification.semanticRole = "navigation";
    }

    return classification;
  }, []);

  // React Fiber detection
  const getReactFiberFromElement = (element: HTMLElement): any => {
    const fiberKey = Object.keys(element).find(
      (key) =>
        key.startsWith("__reactFiber") ||
        key.startsWith("__reactInternalInstance"),
    );

    return fiberKey ? (element as any)[fiberKey] : null;
  };

  return (
    <div className="relative">
      <button
        className={`fixed top-4 right-4 z-50 rounded px-3 py-2 text-sm font-medium ${
          isSelectionMode
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
        onClick={() => setSelectionMode(!isSelectionMode)}
      >
        {isSelectionMode ? "Cancel Selection" : "Select Component"}
      </button>

      <Inspector
        active={isSelectionMode}
        disable={!isSelectionMode}
        onHoverElement={(inspectorData) => {
          const element = inspectorData.element as HTMLElement;

          // Enhanced element analysis
          const elementInfo = identifyElementAtCursor(
            element.getBoundingClientRect().left +
              element.getBoundingClientRect().width / 2,
            element.getBoundingClientRect().top +
              element.getBoundingClientRect().height / 2,
          );

          if (elementInfo) {
            const componentChain = detectReactComponent(element);
            const classification = classifyElement(
              element,
              inspectorData.fiber,
            );

            console.log("Enhanced Element Analysis:", {
              elementContext: elementInfo.context,
              componentChain,
              classification,
              fiber: inspectorData.fiber,
            });
          }
        }}
        onClickElement={(inspectorData) => {
          const element = inspectorData.element as HTMLElement;
          const fiber = inspectorData.fiber;

          // Create comprehensive element signature for identification
          const elementSignature = {
            // Visual properties
            tagName: element.tagName.toLowerCase(),
            className: element.className,
            textContent: element.textContent?.trim(),

            // Position and size
            boundingRect: element.getBoundingClientRect(),

            // React component info
            componentName:
              typeof fiber?.type === "function" ? fiber.type.name : fiber?.type,
            isHTMLElement: typeof fiber?.type === "string",

            // Props and children analysis
            props: fiber?.memoizedProps,
            hasReactChildren: Array.isArray(fiber?.memoizedProps?.children),

            // Component tree context
            componentChain: detectReactComponent(element),

            // Classification
            classification: classifyElement(element, fiber),
          };

          console.log("Element Signature:", elementSignature);

          // Generate a unique identifier for this element/component
          const dataBlockId = generateElementId(elementSignature);

          const message = prompt(
            `Provide feedback for element: ${dataBlockId}`,
          );
          if (message) {
            handleGranularUserFeedback({
              message,
              dataBlockId,
            });
          }

          setSelectionMode(false);
        }}
      />

      {children}
    </div>
  );

  // Generate unique identifier for elements
  function generateElementId(signature: any): string {
    const { componentChain, tagName, className, textContent } = signature;

    // Prefer React component name if available
    if (componentChain && componentChain.length > 0) {
      const topComponent = componentChain[0];
      return `${topComponent.name}:${topComponent.source?.fileName || "unknown"}`;
    }

    // Fallback to element-based identification
    const classPrefix = className.split(" ")[0] || tagName;
    const contentHint = textContent ? textContent.slice(0, 20) : "";
    return `${classPrefix}:${contentHint}`.replace(/[^a-zA-Z0-9:]/g, "_");
  }
}
