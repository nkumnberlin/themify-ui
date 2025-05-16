"use client";

import { useForm } from "react-hook-form";
import { Input } from "@headlessui/react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

export default function ChatArea() {
  const { register, handleSubmit, reset } = useForm<{ message: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
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

      const aiMessageId = Date.now();
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, role: "ai", content: "... Typing" },
      ]);
      console.log("ai is doing quatsch");
      let buffer = "";
      console.log("buffer", buffer);

      // Update the last AI message by ID
      const updateAIMessage = (content: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content } : msg,
          ),
        );
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep any incomplete line

        console.log("is done", done, "or value", lines);
        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line);
            const content = parsed?.kwargs?.content ?? "";

            if (content) {
              aiContent += content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId ? { ...msg, content: aiContent } : msg,
                ),
              );
            }
          } catch (err) {
            console.error("Failed to parse stream line:", err);
          }
        }
      }

      // Finalize message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: aiContent || "Done." }
            : msg,
        ),
      );
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
          <div
            key={msg.id}
            className={`max-w-xs rounded-lg px-4 py-2 ${
              msg.role === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 text-gray-900"
            }`}
          >
            {msg.content}
          </div>
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
