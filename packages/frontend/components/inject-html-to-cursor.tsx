"use client";

import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CursorButton } from "@/components/cursor-button";
import { useForm } from "react-hook-form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";

export type FormValues = { change: string };

type InjectHtmlToCursorProps = {
  children: ReactNode;
  handleGranularUserFeedback: ({
    message,
    dataBlockId,
  }: {
    message: string;
    dataBlockId: string;
  }) => void;
};

export default function InjectHtmlToCursor({
  children,
  handleGranularUserFeedback,
}: InjectHtmlToCursorProps) {
  const [active, setActive] = useState(false);
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    if (!selectedEl) return;
    const dataBlockId = selectedEl.getAttribute("data-block-id") || "";
    handleGranularUserFeedback({
      message: data.change,
      dataBlockId,
    });
    setSelectedEl(null);
  };

  const findDataBlockElement = (el: HTMLElement | null) => {
    if (!el || !containerRef.current) return null;
    const candidate = el.closest<HTMLElement>("[data-block-id]");
    if (candidate && containerRef.current.contains(candidate)) {
      return candidate;
    }
    return null;
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!active) return;
      const target = e.target as HTMLElement;
      const candidate = findDataBlockElement(target);
      setHoveredEl(candidate);
    },
    [active],
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // If we're editing (selectedEl != null), and the click is outside the form,
      // clear selection & highlight.
      if (selectedEl) {
        if (formRef.current && !formRef.current.contains(target)) {
          setSelectedEl(null);
          setHoveredEl(null);
        }
        return;
      }

      // If click was the activate button, do nothing here
      if (target.id === "activate-button") return;

      // Otherwise, if in active mode, try to select a data-block-id element
      if (active) {
        const candidate = findDataBlockElement(target);
        if (candidate) {
          setSelectedEl(candidate);
          reset();
          // Keep `active` false so that hovering stops; highlight will use `selectedEl` instead
          setActive(false);
          setHoveredEl(null);
        }
      }
    },
    [active, selectedEl, reset],
  );

  // Listen for mousemove only when active
  useEffect(() => {
    if (!active) return;
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [active, handleMouseMove]);

  // Listen for click when either active OR editing (selectedEl)
  useEffect(() => {
    if (!(active || selectedEl)) return;
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [active, selectedEl, handleClick]);

  // Position overlay around hoveredEl (if active) or selectedEl (if editing)
  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    const targetEl = active ? hoveredEl : selectedEl;

    if (!targetEl || !overlay || !container) {
      overlay?.style.setProperty("display", "none");
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    overlay.style.setProperty("display", "block");
    overlay.style.setProperty("top", `${rect.top - containerRect.top}px`);
    overlay.style.setProperty("left", `${rect.left - containerRect.left}px`);
    overlay.style.setProperty("width", `${rect.width}px`);
    overlay.style.setProperty("height", `${rect.height}px`);
  }, [hoveredEl, selectedEl, active]);

  // Calculate form position relative to selectedEl
  const inputStyle: CSSProperties = {};
  if (selectedEl && containerRef.current) {
    const rect = selectedEl.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    inputStyle.position = "absolute";
    inputStyle.top = `${rect.top - containerRect.top + 25}px`;
    inputStyle.left = `${rect.left - containerRect.left + 4}px`;
    inputStyle.zIndex = 10000;
  }

  return (
    <div ref={containerRef} className="relative">
      <CursorButton
        id="activate-button"
        onClick={() => {
          setActive((prev) => !prev);
          setSelectedEl(null);
          setHoveredEl(null);
        }}
      />

      {/* Highlight overlay */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          border: "2px dashed gray",
          pointerEvents: "none",
          display: "none",
          zIndex: 999,
        }}
      />

      {selectedEl && (
        <form
          ref={formRef}
          style={inputStyle}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex rounded-2xl border-2 border-gray-100 bg-white p-2">
            <Input
              {...register("change", { required: true })}
              placeholder="Enter change..."
            />
            <Button type="submit" className="ml-2">
              Change
            </Button>
          </div>
        </form>
      )}

      {children}
    </div>
  );
}
