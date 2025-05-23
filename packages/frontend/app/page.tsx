"use client";

import { ReactNode, useState } from "react";
import ChatArea, { BloomingLoadingText } from "@/components/chat";
import { LLMType } from "@/ai/interface";
import { ModeToggle } from "@/components/ui/toogle-dark-mode";
import CodeRenderer from "@/components/code-renderer";
import { useLLMCoder, useUserFeedbackCoder } from "@/hooks/use-llm-chat";
import { Button } from "@ui/button";

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

export default function Home() {
  const [llmType, setLlmType] = useState<LLMType>("architect");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [codeMessages, setCodeMessages] = useState<Message[]>([]);

  const sidebarWidthClass = llmType === "architect" ? "w-full" : "w-1/3";
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

  const switchLLMType = (type: LLMType) => {
    if (type === "architect") return;
    setLlmType(type);
    mutate({
      _llmType: type,
      history: messages,
    });
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
        code: codeMessages,
      },
    });
  };

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden">
      <div
        className={
          "absolute z-10 flex w-full flex-row justify-between px-1 pt-1"
        }
      >
        <ModeToggle />
        <Button
          onClick={() => {
            if (llmType === "coder") {
              return setLlmType("architect");
            }
            setLlmType("coder");
          }}
        >
          Switch to{" "}
          {llmType === "coder"
            ? "Architect to create a new project"
            : "Coder to see the Results"}
        </Button>
      </div>
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

      <main
        className={`flex-1 overflow-y-auto p-4 transition-opacity duration-500 ease-in-out ${
          isArchitect ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <FetchingIsInProcess
          isPending={mutationIsPending || feedbackMutationIsPending}
          codeMessages={codeMessages}
        >
          <CodeRenderer />
        </FetchingIsInProcess>
      </main>
    </div>
  );
}

function FetchingIsInProcess({
  children,
  codeMessages,
  isPending,
}: {
  children: ReactNode;
  codeMessages: Message[];
  isPending: boolean;
}) {
  return (
    <div>
      {isPending && codeMessages.length === 0 && <BloomingLoadingText />}

      {isPending && codeMessages.length > 0 ? (
        <div>
          <BloomingLoadingText />
          {children}
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
