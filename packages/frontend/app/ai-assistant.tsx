"use client";

import { ReactNode, useState } from "react";
import ChatArea, { BloomingLoadingText } from "@/components/chat";
import { LLMType } from "@/ai/interface";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isInspectorActive, setIsInspectorActive] = useState<boolean>(false);
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

    setMessages((prev) => [...prev, userMessage]);

    mutateGranularFeedback({
      _llmType: "coder",
      granularFeedback: {
        message,
        dataBlockId,
      },
    });

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Sidebar Overlay */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full min-w-[300px] border-r border-gray-800 bg-white p-4 shadow-lg transition-transform duration-500 ease-in-out dark:bg-gray-900 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarWidthClass}`}
      >
        {/* Close button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 z-10 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 6-6 6-6-6" />
            <path d="m6 18 6-6 6 6" />
          </svg>
        </button>

        <ChatArea
          llmType={llmType}
          switchLLMToStartCoding={switchLLMType}
          messages={messages}
          setMessages={handleSetMessages}
          addUserFeedbackToCode={addUserFeedbackToCode}
        />
      </aside>

      {/* Sidebar Toggle Button (when closed) */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-40 rounded-md bg-white p-3 shadow-lg hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
          aria-label="Open sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12h18m-9-9l9 9-9 9" />
          </svg>
        </button>
      )}

      {/* Backdrop (optional - for closing sidebar when clicking outside) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="h-full w-full">
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
