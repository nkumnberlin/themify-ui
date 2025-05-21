import { useMutation } from "@tanstack/react-query";
import { LLMType } from "@/ai/interface";
import { decoderLLMStream } from "@/utils/decoderLLMStream";
import { Message } from "@/app/page";

export type UseLMChat = {
  setIsDisabled?: (val: boolean) => void;
  setFocus?: (val: "message") => void;
  llmType: LLMType;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  setCodeMessages: (updater: (prev: Message[]) => Message[]) => void;
};

export default function useLLMChat({
  setIsDisabled,
  llmType,
  setFocus,
  setCodeMessages,
  setMessages,
}: UseLMChat) {
  return useMutation({
    mutationFn: async ({
      message,
      _llmType,
      history,
    }: {
      message?: string;
      _llmType: LLMType;
      history?: Message[];
    }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ content: message, llmType: _llmType, history }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      await decoderLLMStream({
        reader,
        decoder,
        setMessages,
        setCodeMessages,
        aiContent,
        llmType,
      });
    },
    onMutate: () => {
      if (setIsDisabled) setIsDisabled(true);
    },
    onSuccess: () => {
      if (setIsDisabled) setIsDisabled(false);
      if (setFocus) setFocus("message");
    },
  });
}
