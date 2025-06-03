import { Button } from "@ui/button";
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
      aria-label="Send message" data-block-id="components/chat-tools/send-message-button.tsx SendMessageButton"
    >
      <Send className="h-4 w-4" />
    </Button>
  );
}
