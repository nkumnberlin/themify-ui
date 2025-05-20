"use client";

import { useState } from "react";
import ChatArea from "@/components/chat";
import { LLMType } from "@/ai/interface";
import { ModeToggle } from "@/components/ui/toogle-dark-mode";
import CodeRenderer from "@/components/code-renderer";

export default function Home() {
  const [llmType, setLlmType] = useState<LLMType>("architect");

  const sidebarWidthClass = llmType === "architect" ? "w-full" : "w-1/3";
  const isArchitect = llmType === "architect";

  const switchLLMType = (type: LLMType) => {
    setLlmType(type);
  };

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden">
      <ModeToggle />
      <aside
        className={`min-w-[300px] border-r border-gray-800 p-4 transition-[width] duration-500 ease-in-out ${sidebarWidthClass}`}
      >
        <ChatArea llmType={llmType} switchLLMType={switchLLMType} />
      </aside>
      <main
        className={`flex-1 overflow-y-auto p-4 transition-opacity duration-500 ease-in-out ${
          isArchitect ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <CodeRenderer />
        <button
          onClick={() => switchLLMType(isArchitect ? "coder" : "architect")}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        >
          Switch back
        </button>
      </main>
    </div>
  );
}
