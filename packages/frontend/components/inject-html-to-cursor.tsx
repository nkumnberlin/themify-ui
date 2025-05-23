"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { CursorButton } from "@/components/cursor-button";
import { useForm } from "react-hook-form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";

export type FormValues = { change: string };

type InjectHtmlToCursorProps = {
  children: ReactNode;
  handleGranularUserFeedback: ({
    message,
    codeSnippet,
  }: {
    message: string;
    codeSnippet: string;
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
    console.log("Change for element:", selectedEl, data.change);
    handleGranularUserFeedback({
      message: data.change,
      codeSnippet: selectedEl?.outerHTML || "",
    });
    setSelectedEl(null);
  };

  useEffect(() => {
    if (!active) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        containerRef.current &&
        containerRef.current.contains(target) &&
        target !== overlayRef.current &&
        target.id !== "activate-button"
      ) {
        setHoveredEl(target);
      } else {
        setHoveredEl(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === "activate-button") return;

      if (containerRef.current?.contains(target)) {
        setSelectedEl(target);
        reset();
        setActive(false);
        setHoveredEl(null);
      } else {
        setSelectedEl(null);
        setActive(false);
        setHoveredEl(null);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick, true);
    };
  }, [active, reset]);

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
    <div>
      <CursorButton onClick={() => setActive(!active)} />
      <div ref={containerRef} className="relative">
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

        {children}
      </div>
    </div>
  );
}
