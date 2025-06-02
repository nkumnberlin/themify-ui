"use client";

import { ReactNode, useState } from "react";
import ChatArea, { BloomingLoadingText } from "@/components/chat";
import { LLMType } from "@/ai/interface";
import { ModeToggle } from "@ui/toogle-dark-mode";
import {
  useAddGranularUserFeedbackCoder,
  useLLMCoder,
  useUserFeedbackCoder,
} from "@/hooks/use-llm-chat";
import InjectHtmlToCursor from "@/components/inject-html-to-cursor";

export type AddUserFeedbackToCode = {
  message: string;
};

export type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
  isLoading?: boolean;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    content:
      "Hello! My name is Themify, how can I help you to build what you want today?",
  },
];

type AIAssistantProps = {
  children: ReactNode;
};

export default function AiAssistant({ children }: AIAssistantProps) {
  const [llmType, setLlmType] = useState<LLMType>("architect");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [codeMessages, setCodeMessages] = useState<Message[]>([]);
  const [granularUserFeedback, setGranularUserFeedback] = useState<Message[]>(
    [],
  );

  // const sidebarWidthClass = llmType === "architect" ? "w-full" : "w-1/3";
  const sidebarWidthClass = "w-1/3";
  const isArchitect = llmType === "architect";

  const handleSetMessages = (updater: (prev: Message[]) => Message[]) => {
    setMessages(updater);
  };

  const { mutate, isPending: mutationIsPending } = useLLMCoder({
    llmType,
    setCodeMessages,
  });

  const { mutate: mutateFeedback, isPending: feedbackMutationIsPending } =
    useUserFeedbackCoder({
      llmType,
      setCodeMessages,
      setMessages,
    });
  const {
    mutate: mutateGranularFeedback,
    isPending: granularFeedbackMutationIsPending,
  } = useAddGranularUserFeedbackCoder({
    llmType,
    setCodeMessages,
    setMessages,
  });

  const switchLLMType = (type: LLMType) => {
    if (type === "architect") return;
    setLlmType(type);
    mutate({
      _llmType: type,
      history: messages,
    });
  };

  const handleGranularUserFeedback = ({
    message,
    dataBlockId,
  }: {
    message: string;
    dataBlockId: string;
  }) => {
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };
    setGranularUserFeedback((prev) => [...prev, userMessage]);

    // mutateGranularFeedback({
    //   _llmType: "coder",
    //   granularFeedback: {
    //     message,
    //     code: codeMessages[codeMessages.length - 1],
    //     codeSnippet,
    //   },
    // });

    // mutateFeedback({
    //   _llmType: "coder",
    //   feedback: {
    //     message,
    //     code: codeMessages,
    //   },
    // });
    console.log(userMessage, dataBlockId);
  };

  console.log("llmType", llmType);
  console.log("code", codeMessages);
  console.log(mutationIsPending || feedbackMutationIsPending);

  const addUserFeedbackToCode = ({ message }: AddUserFeedbackToCode) => {
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    mutateFeedback({
      _llmType: "coder",
      feedback: {
        message,
        code: codeMessages[codeMessages.length - 1],
      },
    });
  };

  const isARequestPending =
    granularFeedbackMutationIsPending ||
    mutationIsPending ||
    feedbackMutationIsPending;

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden">
      <ModeToggle />
      <aside
        className={`min-w-[300px] border-r border-gray-800 p-4 transition-[width] duration-500 ease-in-out ${sidebarWidthClass}`}
      >
        <ChatArea
          llmType={llmType}
          switchLLMToStartCoding={switchLLMType}
          messages={messages}
          setMessages={handleSetMessages}
          addUserFeedbackToCode={addUserFeedbackToCode}
        />
      </aside>

      <main className={`flex-1`}>
        <FetchingIsInProcess
          isPending={isARequestPending}
          codeMessages={codeMessages}
        >
          <InjectHtmlToCursor
            handleGranularUserFeedback={handleGranularUserFeedback}
          >
            {children}
          </InjectHtmlToCursor>
        </FetchingIsInProcess>
      </main>
    </div>
  );
}

function FetchingIsInProcess({
  children,
  isPending,
}: {
  children: ReactNode;
  codeMessages: Message[];
  isPending: boolean;
}) {
  return (
    <div>
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <BloomingLoadingText />
        </div>
      )}

      <div className={isPending ? "pointer-events-none opacity-50" : ""}>
        {children}
      </div>
    </div>
  );
}
