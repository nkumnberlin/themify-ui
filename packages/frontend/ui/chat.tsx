"use client";

import { useForm } from "react-hook-form";
import { Input } from "@headlessui/react";
import { useState } from "react";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

export default function ChatArea() {
  const { register, handleSubmit, reset } = useForm<{ message: string }>();
  const [messages, setMessages] = useState<Message[]>([]);

  const onSubmit = ({ message }: { message: string }) => {
    if (!message.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: `Echo: ${message}`,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 500);

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
          className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </form>
    </div>
  );
}
