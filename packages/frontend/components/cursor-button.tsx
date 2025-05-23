import { Button } from "@/components/ui/button";
import { MousePointer } from "lucide-react";

interface CursorButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function CursorButton({ onClick, disabled }: CursorButtonProps) {
  return (
    <div
      style={{ left: "calc(95.6667% - 30px)" }}
      className="absolute z-10 flex px-1 pt-1 transition-[width] duration-500 ease-in-out"
    >
      <Button
        id="activate-button"
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        disabled={disabled}
        className="bg-black text-white hover:bg-gray-900"
        aria-label="Cursor Action"
      >
        <MousePointer className="h-5 w-5" />
      </Button>
    </div>
  );
}
