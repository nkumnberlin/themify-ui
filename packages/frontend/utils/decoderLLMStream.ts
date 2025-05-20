import { Message } from "@/ui/chat";
import { AgentData } from "@/ai/interface";

type DecoderLLMStream = {
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  decoder: TextDecoder;
  aiContent: string;
};

// to use with llm.stream
export async function decoderLLMStream({
  setMessages,
  reader,
  decoder,
  aiContent,
}: DecoderLLMStream) {
  const aiMessageId = Date.now();
  setMessages((prev) => [
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
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed: AgentData = JSON.parse(line);
        console.log(parsed);
        for (const message of parsed.agent.messages) {
          const content = message.kwargs.content ?? "";
          if (content) {
            aiContent += content;
            setMessages((prev) =>
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

  setMessages((prev) =>
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
