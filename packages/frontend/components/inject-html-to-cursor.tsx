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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const candidate = findDataBlockElement(target);
    setHoveredEl(candidate);
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === "activate-button") return;

      const candidate = findDataBlockElement(target);
      if (candidate) {
        setSelectedEl(candidate);
        reset();
        setActive(false);
        setHoveredEl(null);
      } else {
        setSelectedEl(null);
        setActive(false);
        setHoveredEl(null);
      }
    },
    [reset],
  );

  useEffect(() => {
    if (!active) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick, true);
    };
  }, [active, handleMouseMove, handleClick]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!hoveredEl || !overlay || !container) {
      overlay?.style.setProperty("display", "none");
      return;
    }
    const rect = hoveredEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    overlay.style.setProperty("display", "block");
    overlay.style.setProperty("top", `${rect.top - containerRect.top}px`);
    overlay.style.setProperty("left", `${rect.left - containerRect.left}px`);
    overlay.style.setProperty("width", `${rect.width}px`);
    overlay.style.setProperty("height", `${rect.height}px`);
  }, [hoveredEl]);

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
      <CursorButton id="activate-button" onClick={() => setActive(!active)} />

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
        <form style={inputStyle} onSubmit={handleSubmit(onSubmit)}>
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

      {/* Render children exactly once */}
      {children}
    </div>
  );
}
