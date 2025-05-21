"use client";

import { ReactNode, useState } from "react";
import ChatArea, { BloomingLoadingText } from "@/components/chat";
import { LLMType } from "@/ai/interface";
import { ModeToggle } from "@/components/ui/toogle-dark-mode";
import CodeRenderer from "@/components/code-renderer";
import { useLLMCoder } from "@/hooks/use-llm-chat";

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

  const switchLLMType = (type: LLMType) => {
    setLlmType(type);
    if (type === "architect") return;
    mutate({
      _llmType: type,
      history: messages,
    });
  };

  console.log(codeMessages);
  console.log(mutationIsPending);

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden">
      <ModeToggle />
      <aside
        className={`min-w-[300px] border-r border-gray-800 p-4 transition-[width] duration-500 ease-in-out ${sidebarWidthClass}`}
      >
        <ChatArea
          llmType={llmType}
          switchLLMType={switchLLMType}
          messages={messages}
          setMessages={handleSetMessages}
        />
      </aside>
      <main
        className={`flex-1 overflow-y-auto p-4 transition-opacity duration-500 ease-in-out ${
          isArchitect ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <FetchingIsInProcess isPending={mutationIsPending}>
          <CodeRenderer />
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
  isPending: boolean;
}) {
  return (
    <div>{isPending ? <BloomingLoadingText /> : <div> {children}</div>}</div>
  );
}
