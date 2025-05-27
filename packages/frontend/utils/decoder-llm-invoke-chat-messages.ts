import { Message } from "@/app/page";

type DecoderLlmInvokeChatMessages = {
  setMessages: (updater: (prev: Message[]) => Message[]) => void;

  reader: ReadableStreamDefaultReader<Uint8Array>;
};

export async function decoderLLMInvokeChatMessages({
  reader,
  setMessages,
}: DecoderLlmInvokeChatMessages) {
  const decoder = new TextDecoder();
  const { done, value } = await reader.read();
  if (done) return;
  const buffer = decoder.decode(value, { stream: false });
  const content = JSON.parse(buffer);
  setMessages((prev) => [
    ...prev,
    {
      id: Date.now(),
      role: "ai",
      content: content,
      isLoading: false,
    },
  ]);
}
