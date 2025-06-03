import { useQuery } from "@tanstack/react-query";
import { routes } from "@/app/api/routes";

export type SuggestionEntry = {
  path: string;
  isFolder: boolean;
};

export function useFilesToFolders() {
  return useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const response = await fetch(routes.suggestions);
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      return (await response.json()) as Promise<
        Record<string, SuggestionEntry[]>
      >;
    },
  });
}
