import React, { useEffect, useRef, useState } from "react";

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
  const overlayRef = useRef<HTMLDivElement>(null);

  // Generic component detection using React Fiber + heuristics
  const detectComponent = (element: HTMLElement): ComponentInfo | null => {
    // Strategy 1: Try React Fiber detection
    const fiber = getReactFiberFromElement(element);
    if (fiber) {
      const componentInfo = getComponentInfoFromFiber(fiber, element);
      if (componentInfo && componentInfo.name !== "Unknown") {
        return componentInfo;
      }
    }

    // Strategy 2: Smart heuristics for components
    const componentInfo = detectByHeuristics(element);
    if (componentInfo) {
      return componentInfo;
    }

    // Strategy 3: Traverse up DOM tree to find a React component
    let current = element.parentElement;
    while (current && current !== document.body) {
      const parentFiber = getReactFiberFromElement(current);
      if (parentFiber) {
        const parentComponentInfo = getComponentInfoFromFiber(
          parentFiber,
          current,
        );
        console.log("parentComponentInfo", parentComponentInfo);
        if (parentComponentInfo && parentComponentInfo.name !== "Unknown") {
          return {
            ...parentComponentInfo,
            element: current,
          };
        }
      }
      current = current.parentElement;
    }

    return null;
  };

  // Enhanced heuristic detection for generated components
  const detectByHeuristics = (element: HTMLElement): ComponentInfo | null => {
    const classList = Array.from(element.classList);
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim() || "";

    // Check if element looks like a meaningful component
    const hasSignificantClasses = classList.some(
      (cls) =>
        cls.includes("flex") ||
        cls.includes("items-") ||
        cls.includes("justify-") ||
        cls.includes("bg-") ||
        cls.includes("text-") ||
        cls.includes("p-") ||
        cls.includes("m-") ||
        cls.includes("rounded") ||
        cls.includes("border") ||
        cls.includes("shadow"),
    );

    const hasSignificantStructure =
      element.children.length > 0 || textContent.length > 0;

    const isInteractiveElement =
      tagName === "button" ||
      tagName === "input" ||
      tagName === "select" ||
      tagName === "textarea" ||
      element.hasAttribute("onClick") ||
      classList.some((cls) => cls.includes("button") || cls.includes("input"));

    if (
      hasSignificantClasses ||
      hasSignificantStructure ||
      isInteractiveElement
    ) {
      // Generate component name based on content and structure
      let componentName = generateComponentName(element);

      return {
        name: componentName,
        filePath: `components/suggestions/${componentName}.tsx`,
        element,
      };
    }

    return null;
  };

  // Generate meaningful component names based on element analysis
  const generateComponentName = (element: HTMLElement): string => {
    const classList = Array.from(element.classList);
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim() || "";

    // Check for specific patterns
    if (textContent.includes("TAME") || textContent.includes("Tame")) {
      return "TameComponent";
    }

    if (
      tagName === "button" ||
      classList.some((cls) => cls.includes("button"))
    ) {
      if (textContent) {
        const cleanText = textContent.replace(/[^a-zA-Z]/g, "");
        return cleanText.length > 0 ? `${cleanText}Button` : "Button";
      }
      return "Button";
    }

    if (tagName === "input" || classList.some((cls) => cls.includes("input"))) {
      return "InputField";
    }

    if (classList.some((cls) => cls.includes("card"))) {
      return "Card";
    }

    if (
      classList.some((cls) => cls.includes("modal") || cls.includes("dialog"))
    ) {
      return "Modal";
    }

    if (classList.some((cls) => cls.includes("nav"))) {
      return "Navigation";
    }

    if (classList.some((cls) => cls.includes("header"))) {
      return "Header";
    }

    if (classList.some((cls) => cls.includes("footer"))) {
      return "Footer";
    }

    if (classList.some((cls) => cls.includes("sidebar"))) {
      return "Sidebar";
    }

    // Look for flex layouts that might be components
    if (classList.includes("flex")) {
      if (classList.some((cls) => cls.includes("col"))) {
        return "Layout";
      }
      if (classList.some((cls) => cls.includes("items-center"))) {
        return "CenteredContainer";
      }
    }

    // Generate name based on semantic meaning
    if (textContent) {
      const words = textContent
        .split(/\s+/)
        .filter((word) => word.length > 2 && /^[a-zA-Z]+$/.test(word));
      if (words.length > 0) {
        const mainWord = words[0];
        return `${mainWord.charAt(0).toUpperCase()}${mainWord.slice(1)}Component`;
      }
    }

    // Fallback based on element type
    const tagMap: Record<string, string> = {
      div: "Container",
      section: "Section",
      article: "Article",
      aside: "Sidebar",
      main: "MainContent",
      header: "Header",
      footer: "Footer",
      nav: "Navigation",
      form: "Form",
      ul: "List",
      ol: "OrderedList",
      li: "ListItem",
    };

    return tagMap[tagName] || "Component";
  };

  // React Fiber detection
  const getReactFiberFromElement = (element: HTMLElement): any => {
    const fiberKey = Object.keys(element).find(
      (key) =>
        key.startsWith("__reactFiber") ||
        key.startsWith("__reactInternalInstance"),
    );

    return fiberKey ? (element as any)[fiberKey] : null;
  };

  const getComponentInfoFromFiber = (
    fiber: any,
    originalElement: HTMLElement,
  ): ComponentInfo | null => {
    let current = fiber;
    console.log("getComponentInfoFromFiber", current);

    while (current) {
      if (current.type && typeof current.type === "function") {
        const componentName =
          current.type.name || current.type.displayName || "Unknown";

        // Skip built-in React components and common wrapper components
        if (
          componentName === "Unknown" ||
          componentName.startsWith("_") ||
          ["div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6"].includes(
            componentName.toLowerCase(),
          )
        ) {
          current = current.return;
          continue;
        }

        let filePath = "unknown";

        // Try to get file path from React DevTools info
        if (current._debugSource) {
          filePath = current._debugSource.fileName;
        } else if (current.type.__source) {
          filePath = current.type.__source.fileName;
        } else {
          // Generate likely file path
          filePath = `components/suggestions/${componentName}.tsx`;
        }
        return {
          name: componentName,
          filePath: filePath,
          element: current.stateNode || originalElement,
        };
      }
      current = current.return;
    }

    return null;
  };

  // Handle component selection
  const selectComponent = (componentInfo: ComponentInfo) => {
    const dataBlockId = `${componentInfo.filePath} ${componentInfo.name}`;

    const message = prompt(
      `Provide feedback for component "${componentInfo.name}":`,
    );
    if (message) {
      handleGranularUserFeedback({
        message,
        dataBlockId,
      });
    }

    setSelectionMode(false);
  };

  // Get element at point, excluding our overlay
  const getElementAtPoint = (x: number, y: number): HTMLElement | null => {
    // Temporarily hide overlay to get element underneath
    if (overlayRef.current) {
      overlayRef.current.style.display = "none";
    }

    const element = document.elementFromPoint(x, y) as HTMLElement;

    // Restore overlay
    if (overlayRef.current) {
      overlayRef.current.style.display = "block";
    }

    return element;
  };

  // Mouse event handling
  useEffect(() => {
    if (!isSelectionMode) {
      setHoveredElement(null);
      setDetectedComponent(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Get the actual element under the cursor, not the overlay
      const target = getElementAtPoint(e.clientX, e.clientY);

      if (!target) return;

      setHoveredElement(target);

      // Detect component info immediately on hover
      const componentInfo = detectComponent(target);
      setDetectedComponent(componentInfo);
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Get the actual element under the cursor, not the overlay
      const target = getElementAtPoint(e.clientX, e.clientY);

      if (!target) return;

      const componentInfo = detectComponent(target);
      if (componentInfo) {
        selectComponent(componentInfo);
      } else {
        alert("No component detected for this element");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectionMode(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelectionMode]);

  // Create highlight overlay
  const createHighlightOverlay = () => {
    if (!hoveredElement || !isSelectionMode) return null;

    const rect = hoveredElement.getBoundingClientRect();

    return (
      <div
        ref={overlayRef}
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      >
        {/* Highlight border */}
        <div
          className={`absolute inset-0 border-2 ${
            detectedComponent
              ? "border-blue-500 bg-blue-500/10"
              : "border-red-500 bg-red-500/10"
          }`}
        />

        {/* Component info tooltip */}
        {detectedComponent && (
          <div className="absolute -top-16 left-0 z-10 max-w-xs rounded bg-gray-900 px-2 py-1 text-xs text-white">
            <div className="font-semibold">{detectedComponent.name}</div>
            <div className="text-xs text-gray-300">
              {detectedComponent.filePath}
            </div>
          </div>
        )}

        {/* No component detected warning */}
        {!detectedComponent && (
          <div className="absolute -top-8 left-0 z-10 rounded bg-red-600 px-2 py-1 text-xs text-white">
            No component detected
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Selection mode toggle */}
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

      {/* Selection mode indicator */}
      {isSelectionMode && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded bg-blue-600 px-4 py-2 text-white">
          <div>Click on any component to provide feedback (ESC to cancel)</div>
          <div className="mt-1 text-xs">
            Blue = detected component | Red = no component found
          </div>
        </div>
      )}

      {/* Main content */}
      {children}

      {/* Highlight overlay */}
      {createHighlightOverlay()}

      {/* Selection mode overlay - removed as it was blocking interactions */}
    </div>
  );
}
