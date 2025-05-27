"use client";

import { ReactNode, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./auto-suggest-input.module.css";
import { ScrollArea } from "@ui/scroll-area";
import { Card } from "@ui/card";
import { routes } from "@/app/routes";

export default function AutoSuggestInput({
  input,
  children,
  handleSuggestion,
}: {
  input: string;
  children: ReactNode;
  handleSuggestion: (val: string) => void;
}) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: groupedSuggestions } = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const response = await fetch(routes.suggestions);
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      return (await response.json()) as Promise<Record<string, string[]>>;
    },
  });

  useEffect(() => {
    if (!groupedSuggestions) return;
    if (!input) return;
    const match = input.match(/@(\S*)$/);
    if (!match) {
      return setShowSuggestions(false);
    }
    const term = match[1];
    const all = Object.values(groupedSuggestions).flat();
    const filtered = all.filter((suggestion) =>
      suggestion.includes(`@${term}`),
    );
    setFiltered(filtered);
    setShowSuggestions(true);
  }, [input, groupedSuggestions]);
  console.log(filtered);
  return (
    <div className="relative w-full">
      {showSuggestions && filtered.length > 0 && (
        <Card
          className={`${styles.scrollRounded} absolute bottom-full mb-1 max-h-60 w-full overflow-y-auto p-0 shadow`}
        >
          <ScrollArea className="max-h-60">
            {filtered.map((suggestion) => (
              <div
                key={suggestion}
                onClick={() => {
                  handleSuggestion(suggestion);
                  setShowSuggestions(false);
                }}
                className="hover:bg-muted cursor-pointer px-4 py-2"
              >
                {suggestion}
              </div>
            ))}
          </ScrollArea>
        </Card>
      )}
      {children}
    </div>
  );
}
