import { SendMessageButton } from "@/components/chat-tools/send-message-button";
import { MicButton } from "@/components/chat-tools/mic-button";
import React from "react";
import { AnalyzeCodeButton } from "@/components/chat-tools/analyze-code-button";

export type ToolsProps = {
  onSend: () => void;
  onMic: () => void;
  onFolder: () => void;
  isRecording: boolean;
  disabled: boolean;
};

const ChatTools = ({
  onSend,
  onMic,
  onFolder,
  isRecording,
  disabled,
}: ToolsProps) => {
  return (
    <div className="flex flex-col gap-2" data-block-id="components/chat-tools/chat-tools.tsx ChatTools">
      <SendMessageButton disabled={disabled} onClick={onSend} />
      <AnalyzeCodeButton onClick={() => console.log("was")} />
      <MicButton
        onClick={onMic}
        isRecording={isRecording}
        disabled={disabled}
      />
      {/*<FolderButton onClick={onFolder} />*/}
    </div>
  );
};

export default ChatTools;
