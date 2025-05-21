import { useMutation } from "@tanstack/react-query";
import { LLMType } from "@/ai/interface";
import { decoderLLMStream } from "@/utils/decoderLLMStream";
import { Message } from "@/app/page";

export type UseLMChat = {
  setIsDisabled?: (val: boolean) => void;
  setFocus?: (val: "message") => void;
  llmType: LLMType;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
};

export default function useLLMChat({
  setIsDisabled,
  llmType,
  setFocus,
  setMessages,
}: UseLMChat) {
  return useMutation({
    mutationFn: async ({
      message,
      _llmType,
    }: {
      message: string;
      _llmType: LLMType;
    }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ content: message, llmType: _llmType }),
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

type LLMCoderProps = {
  llmType: LLMType;
  setCodeMessages: (updater: (prev: Message[]) => Message[]) => void;
};

export function useLLMCoder({ llmType, setCodeMessages }: LLMCoderProps) {
  return useMutation({
    mutationFn: async ({
      _llmType,
      history,
    }: {
      message?: string;
      _llmType: LLMType;
      history?: Message[];
    }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ llmType: _llmType, history }),
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
        setCodeMessages,
        aiContent,
        llmType,
      });
    },
  });
}
