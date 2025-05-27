import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";

interface FolderButtonProps {
  onClick: () => void;
}

export function FolderButton({ onClick }: FolderButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="ml-2 border-2 hover:bg-gray-100"
      aria-label="Open folder"
    >
      <Folder className="h-4 w-4" />
    </Button>
  );
}
