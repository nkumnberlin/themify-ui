import { useMutation } from "@tanstack/react-query";
import { Feedback, GranularFeedback, LLMType } from "@/ai/interface";
import { decoderLLMStream } from "@/utils/decoder-llm-stream";
import { Message } from "@/app/page";
import { decoderLLMInvoke } from "@/utils/decoder-llm-invoke";

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
      await decoderLLMInvoke({ reader, setCodeMessages });
    },
  });
}

type AddUserFeedback = {
  _llmType: LLMType;
  feedback: Feedback;
};

type UserFeedbackCoderProps = {
  llmType: LLMType;
  setCodeMessages: (updater: (prev: Message[]) => Message[]) => void;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
};

export function useUserFeedbackCoder({
  setCodeMessages,
  setMessages,
}: UserFeedbackCoderProps) {
  return useMutation({
    mutationFn: async ({ _llmType, feedback }: AddUserFeedback) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ llmType: _llmType, feedback }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      await decoderLLMInvoke({ reader, setCodeMessages }).finally(() => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "ai", content: "Code has been updated!" },
        ]);
      });
    },
  });
}

type AddGranularUserFeedback = {
  _llmType: LLMType;
  granularFeedback: GranularFeedback;
};

type AddGranularUserFeedbackCoderProps = {
  llmType: LLMType;
  setCodeMessages: (updater: (prev: Message[]) => Message[]) => void;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
};

export function useAddGranularUserFeedbackCoder({
  setCodeMessages,
  setMessages,
}: AddGranularUserFeedbackCoderProps) {
  return useMutation({
    mutationFn: async ({
      _llmType,
      granularFeedback,
    }: AddGranularUserFeedback) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ llmType: _llmType, granularFeedback }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      await decoderLLMInvoke({ reader, setCodeMessages }).finally(() => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "ai", content: "Code has been updated!" },
        ]);
      });
    },
  });
}
