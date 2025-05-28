import { Message } from "@/components/ai-assistant";
import { AgentData, LLMType } from "@/ai/interface";

type DecoderLlmStream = {
  setMessages?: (updater: (prev: Message[]) => Message[]) => void;
  setCodeMessages?: (updater: (prev: Message[]) => Message[]) => void;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  decoder: TextDecoder;
  aiContent: string;
  llmType: LLMType;
};

export async function decoderLLMStream({
  setMessages,
  setCodeMessages,
  reader,
  decoder,
  llmType,
  aiContent,
}: DecoderLlmStream) {
  let messageSetter = setMessages;
  if (llmType === "coder") {
    messageSetter = setCodeMessages;
  }
  if (!messageSetter) {
    throw new Error('"setMessages" or "setCodeMessages" is required');
  }
  const aiMessageId = Date.now();
  messageSetter((prev) => [
    ...prev,
    {
      id: aiMessageId,
      role: "ai",
      content: "AI is thinking...",
      isLoading: true,
    },
  ]);
  let buffer = "";
  const { done, value } = await reader.read();
  if (done) return;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      let parsed = JSON.parse(line);
      parsed = parsed as AgentData;
      console.log("before the rror", parsed);
      if (!parsed?.agent?.messages) {
        return;
      }
      for (const message of parsed?.agent?.messages) {
        const content = message.kwargs.content ?? "";
        if (content) {
          aiContent += content;
        }
      }
    } catch (err) {
      console.error("Failed to parse stream line:", err);
    }
  }

  messageSetter((prev) =>
    prev.map((msg) =>
      msg.id === aiMessageId
        ? {
            ...msg,
            content: aiContent || "Done. - There might be an error",
            isLoading: false,
          }
        : msg,
    ),
  );
}
