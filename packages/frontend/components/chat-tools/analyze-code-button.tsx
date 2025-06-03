import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface AnalyzeCodeButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AnalyzeCodeButton({
  onClick,
  disabled,
}: AnalyzeCodeButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="ml-2 border-2 hover:bg-gray-100"
      aria-label="Analyze code" data-block-id="components/chat-tools/analyze-code-button.tsx AnalyzeCodeButton"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
}
