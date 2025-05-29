"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import styles from "./auto-suggest-input.module.css";
import { ScrollArea } from "@ui/scroll-area";
import { Card } from "@ui/card";
import {
  SuggestionEntry,
  useFilesToFolders,
} from "@/hooks/use-files-to-folders";

export default function AutoSuggestInput({
  input,
  children,
  handleSuggestion,
}: {
  input: string;
  children: ReactNode;
  handleSuggestion: (val: string) => void;
}) {
  const [filtered, setFiltered] = useState<SuggestionEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: groupedSuggestions } = useFilesToFolders();

  useEffect(() => {
    if (!groupedSuggestions) return;
    if (!input || input.length < 4) return;
    const match = input.match(/@(\S*)$/);
    if (!match) {
      return setShowSuggestions(false);
    }
    const term = match[1];
    const all = Object.values(groupedSuggestions).flat();
    const filtered = all.filter((entry) => entry.path.includes(`@${term}`));

    setFiltered(filtered);
    setHighlightedIndex(0);
    setShowSuggestions(true);
  }, [input, groupedSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showSuggestions || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filtered.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === 0 ? filtered.length - 1 : prev - 1,
      );
      return;
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      return;
    }
    if (e.key !== "Enter") return;
    const selected = filtered[highlightedIndex];
    if (!selected) return;

    e.preventDefault();
    e.stopPropagation();
    handleSuggestion(selected.path);
    setShowSuggestions(false);
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="relative w-full"
      tabIndex={0} // Needed for div to receive key events
    >
      {showSuggestions && filtered.length > 0 && (
        <Card
          className={`${styles.scrollRounded} absolute bottom-full mb-1 max-h-60 w-full overflow-y-auto p-0 shadow`}
        >
          <ScrollArea className="max-h-60">
            {filtered.map(({ path, isFolder }, index) => (
              <div
                key={path}
                onClick={() => {
                  handleSuggestion(path);
                  setShowSuggestions(false);
                }}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 ${
                  index === highlightedIndex ? "bg-muted" : ""
                } hover:bg-muted`}
              >
                {isFolder ? (
                  <span className="font-medium text-blue-600">{path}</span>
                ) : (
                  <span>{path}</span>
                )}
              </div>
            ))}
          </ScrollArea>
        </Card>
      )}
      {children}
    </div>
  );
}
