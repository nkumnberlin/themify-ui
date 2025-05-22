import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface MicButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isRecording: boolean;
}

export function MicButton({ onClick, disabled, isRecording }: MicButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={`ml-2 border-2 ${
        isRecording
          ? "bg-red-600 text-white hover:bg-red-700"
          : "hover:bg-gray-100"
      }`}
      aria-label="Start voice input"
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
}
