import ReactMarkdown from "react-markdown";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { LLMType } from "@/ai/interface";
import { Button } from "@/components/ui/button";
import { startCoding } from "@/ai/instructions/architect";
import useLLMChat from "@/hooks/use-llm-chat";
import { Textarea } from "@ui/textarea";
import remarkBreaks from "remark-breaks";
import { MicButton } from "@/components/mic-button";
import { SendMessageButton } from "@/components/send-message-button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import AutoSuggestInput from "@/components/auto-suggest-input/auto-suggest-input";
import { FolderButton } from "@/components/folder-button";
import {
  useLLMFileFeedback,
  useLLMFileReader,
} from "@/hooks/use-llm-file-context";
import { usePathname } from "next/navigation";
import { Message } from "@/app/ai-assistant";
import {
  folderInformationText,
  locationInformationText,
} from "@/ai/instructions/location-finder";
import { useFilesToFolders } from "@/hooks/use-files-to-folders";

export type ChatAreaProperties = {
  llmType: LLMType;
  switchLLMToStartCoding: (type: LLMType) => void;
  messages: Message[];
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  addUserFeedbackToCode: ({ message }: { message: string }) => void;
};

export type Form = {
  message: string;
};

export default function ChatArea({
  llmType,
  switchLLMToStartCoding,
  setMessages,
  messages,
  addUserFeedbackToCode,
}: ChatAreaProperties) {
  const { register, handleSubmit, reset, setFocus, setValue, watch } =
    useForm<Form>();
  const {
    isRecording,
    startRecording,
    stopRecording,
    isPending: audioTranscriptIsPending,
  } = useAudioRecorder({
    setValue,
  });
  const pathname = usePathname();

  const messageValue = watch("message");
  const [isDisabled, setIsDisabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { mutate: mutateChatAnswer, isPending: mutationIsPending } = useLLMChat(
    {
      setIsDisabled,
      llmType,
      setFocus,
      setMessages,
    },
  );

  const { mutate: mutateFileContextFeedback } = useLLMFileFeedback({
    setMessages,
  });

  const handleFileChangeContent = ({
    message,
    codeSnippet,
  }: {
    message: string;
    codeSnippet: string;
  }) => {
    mutateFileContextFeedback({
      message,
      codeSnippet,
    });
  };

  const { mutate: mutateFileContext, isPending: fileContextIsPending } =
    useLLMFileReader({
      setMessages,
    });

  const { data: groupedSuggestions } = useFilesToFolders();

  useEffect(() => {
    setFocus("message");
  }, []);

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    const currentMessage = messageValue;
    const lastAtMatch = currentMessage.match(/@(\S*)$/);

    if (!lastAtMatch) return;

    const matchIndex = currentMessage.lastIndexOf(lastAtMatch[0]);
    const before = currentMessage.slice(0, matchIndex);
    const after = currentMessage.slice(matchIndex + lastAtMatch[0].length);

    const newText = `${before}${suggestion}${after}`;
    setValue("message", newText);
    setFocus("message");
  };

  const onSubmit = ({ message }: { message: string }) => {
    if (!message.trim()) return;
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    if (llmType === "coder") {
      addUserFeedbackToCode({ message });
      reset();
      return;
    }

    setMessages((prev) => [...prev, userMessage]);
    mutateChatAnswer({ message, _llmType: "architect" });

    reset();
  };

  const onStartCoding = () => {
    switchLLMToStartCoding("coder");
  };

  const handleFileContext = () => {
    const messageWithLocation = `${messageValue}. ${locationInformationText} ${pathname}.
     ${folderInformationText}: ${JSON.stringify(groupedSuggestions)} `;
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageWithLocation,
    };
    setMessages((prev) => [...prev, userMessage]);
    mutateFileContext({ message: messageWithLocation });
  };

  const isFieldDisabled =
    mutationIsPending ||
    audioTranscriptIsPending ||
    isDisabled ||
    fileContextIsPending;

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
      <div ref={messagesEndRef} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-t border-gray-300 p-4"
      >
        <div className="flex h-full">
          <AutoSuggestInput
            input={messageValue}
            handleSuggestion={handleSuggestion}
          >
            <Textarea
              {...register("message")}
              placeholder="Type your message..."
              disabled={isFieldDisabled}
              className="h-full w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </AutoSuggestInput>
          <div className="flex flex-col gap-2">
            <SendMessageButton
              disabled={isFieldDisabled}
              onClick={handleSubmit(onSubmit)}
            />
            <MicButton
              onClick={handleMicClick}
              isRecording={isRecording}
              disabled={isFieldDisabled}
            />
            <FolderButton onClick={handleFileContext} />
          </div>
        </div>
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
