"use client";
import ReactMarkdown from "react-markdown";
import { useForm } from "react-hook-form";
import { Input } from "@headlessui/react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { decoderLLMStream } from "@/utils/decoderLLMStream";

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
    content: "Hello! What do you want to build today?",
  },
];

export default function ChatArea() {
  const { register, handleSubmit, reset } = useForm<{ message: string }>();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isDisabled, setIsDisabled] = useState(false);

  const { mutate } = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ content: message }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setIsDisabled(true);
      if (!response.body) throw new Error("No response body");
      console.log("has a body", response.body);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      await decoderLLMStream({ reader, decoder, setMessages, aiContent });
    },
    onSuccess: () => {
      setIsDisabled(false);
    },
  });

  const onSubmit = ({ message }: { message: string }) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);

    mutate(message);

    reset();
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((msg) => (
          <span key={msg.id}>
            {msg.isLoading ? (
              <BloomingLoadingText text={msg.content} />
            ) : (
              <div
                key={msg.id}
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-200 text-gray-900"
                }`}
              >
                <div className="prose prose-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </span>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-t border-gray-300 p-4"
      >
        <Input
          {...register("message")}
          type="text"
          placeholder="Type your message..."
          disabled={isDisabled}
          className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </form>
    </div>
  );
}

function BloomingLoadingText({ text = "AI is thinking..." }) {
  return (
    <div className="flex items-center space-x-2">
      <span>{text}</span>
      <span className="flex space-x-1">
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
