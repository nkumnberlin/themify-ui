import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface SendMessageButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SendMessageButton({
  onClick,
  disabled,
}: SendMessageButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="ml-2 border-2 hover:bg-gray-100"
      aria-label="Send message"
    >
      <Send className="h-4 w-4" />
    </Button>
  );
}
