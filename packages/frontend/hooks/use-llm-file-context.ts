import { Message } from "@/components/ai-assistant";
import { useMutation } from "@tanstack/react-query";
import { routes } from "@/app/routes";
import { decoderLLMInvokeChatMessages } from "@/utils/decoder-llm-invoke-chat-messages";

type LLMFileReaderProperties = {
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
};

export function useLLMFileReader({ setMessages }: LLMFileReaderProperties) {
  return useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch(routes.fileContext, {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      await decoderLLMInvokeChatMessages({ reader, setMessages });
    },
  });
}
