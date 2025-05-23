import { Message } from "@/app/page";

type DecoderLLMInvoke = {
  setCodeMessages: (updater: (prev: Message[]) => Message[]) => void;
  reader: ReadableStreamDefaultReader<Uint8Array>;
};

export async function decoderLLMInvoke({
  reader,
  setCodeMessages,
}: DecoderLLMInvoke) {
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
