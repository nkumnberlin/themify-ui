import { Message } from "@/app/page";
import { AgentData, LLMType } from "@/ai/interface";

type DecoderLLMStream = {
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  setCodeMessages: (updater: (prev: Message[]) => Message[]) => void;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  decoder: TextDecoder;
  aiContent: string;
  llmType: LLMType;
};

// to use with llm.stream
export async function decoderLLMStream({
  setMessages,
  setCodeMessages,
  reader,
  decoder,
  llmType,
  aiContent,
}: DecoderLLMStream) {
  let messageSetter = setMessages;
  if (llmType === "coder") {
    messageSetter = setCodeMessages;
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
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
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
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    console.log("llmType", llmType);
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        let parsed = JSON.parse(line);
        parsed = parsed as AgentData;
        for (const message of parsed.agent.messages) {
          const content = message.kwargs.content ?? "";
          if (content) {
            aiContent += content;
            messageSetter((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: aiContent, isLoading: false }
                  : msg,
              ),
            );
          }
        }
      } catch (err) {
        console.error("Failed to parse stream line:", err);
      }
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
