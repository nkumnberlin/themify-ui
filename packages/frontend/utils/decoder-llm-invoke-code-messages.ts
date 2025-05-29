import { Message } from "@/app/ai-assistant";

type DecoderLlmInvokeCodeMessages = {
  setCodeMessages: (updater: (prev: Message[]) => Message[]) => void;
  reader: ReadableStreamDefaultReader<Uint8Array>;
};

export async function decoderLLMInvokeCodeMessages({
  reader,
  setCodeMessages,
}: DecoderLlmInvokeCodeMessages) {
  const decoder = new TextDecoder();
  const { done, value } = await reader.read();
  if (done) return;
  const buffer = decoder.decode(value, { stream: false });
  const code = JSON.parse(buffer);
  setCodeMessages((prev) => [
    ...prev,
    {
      id: Date.now(),
      role: "ai",
      content: code,
      isLoading: true,
    },
  ]);
}
