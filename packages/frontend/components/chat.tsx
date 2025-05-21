import ReactMarkdown from "react-markdown";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { LLMType } from "@/ai/interface";
import { Button } from "@/components/ui/button";
import { startCoding } from "@/ai/instructions/architect";
import useLLMChat from "@/hooks/use-llm-chat";
import { Message } from "@/app/page";
import { Textarea } from "@ui/textarea";
import remarkBreaks from "remark-breaks";

export type ChatAreaProperties = {
  llmType: LLMType;
  switchLLMType: (type: LLMType) => void;
  messages: Message[];
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
};

export default function ChatArea({
  llmType,
  switchLLMType,
  setMessages,
  messages,
}: ChatAreaProperties) {
  const { register, handleSubmit, reset, setFocus } = useForm<{
    message: string;
  }>();
  const [isDisabled, setIsDisabled] = useState(false);

  const { mutate, isPending: mutationIsPending } = useLLMChat({
    setIsDisabled,
    llmType,
    setFocus,
    setMessages,
  });

  useEffect(() => {
    setFocus("message");
  }, []);

  const onSubmit = ({ message }: { message: string }) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    mutate({ message, _llmType: "architect" });

    reset();
  };

  const onStartCoding = () => {
    switchLLMType("coder");
  };
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((msg) => (
          <span key={msg.id}>
            <div
              className={`mt-3 max-w-lg rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "ml-auto bg-blue-500"
                  : "mr-auto bg-gray-200"
              }`}
            >
              <div className="prose prose-sm">
                {msg.content
                  .toLowerCase()
                  .includes(startCoding.toLowerCase()) ? (
                  <StartCodingMessage
                    message={msg.content}
                    onStartCoding={onStartCoding}
                  />
                ) : (
                  <div className={msg.role === "user" ? "text-white" : ""}>
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </span>
        ))}
        {mutationIsPending && (
          <BloomingLoadingText text={"Themify is thinking..."} />
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-t border-gray-300 p-4"
      >
        <Textarea
          {...register("message")}
          placeholder="Type your message..."
          disabled={isDisabled}
          className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />
      </form>
    </div>
  );
}

export function BloomingLoadingText({
  text = "Themify is generating code...",
}) {
  return (
    <div className="prose prose-sm mt-3 mr-auto max-w-lg rounded-lg bg-gray-200 px-4 py-2 text-gray-900">
      <span>{text}</span>
      <span className="ml-1 space-x-1">
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "0.4s" }}
        />
      </span>
    </div>
  );
}

function StartCodingMessage({
  message,
  onStartCoding,
}: {
  message: string;
  onStartCoding: () => void;
}) {
  const parts = message.split(new RegExp(`(${startCoding})`, "i"));

  return (
    <span>
      {parts.map((part, idx) =>
        part.toLowerCase() === startCoding.toLowerCase() ? (
          <Button
            key={idx}
            onClick={onStartCoding}
            className="bg-background mx-1 cursor-pointer text-current"
          >
            {startCoding}
          </Button>
        ) : (
          <ReactMarkdown key={idx}>{part}</ReactMarkdown>
        ),
      )}
    </span>
  );
}
