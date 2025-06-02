import { AzureChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { coderInstructions } from "@/ai/instructions/coder";
import { Message } from "@/app/ai-assistant";
import { fileBuilderAgentLLM } from "@/ai/agents/file-builder";
import { Feedback, GranularFeedback } from "@/ai/interface";
import { feedbackCoderInstructions } from "@/ai/instructions/feedback-coder";

const coderLLM = new AzureChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY, // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION, // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  azureOpenAIBasePath: process.env.AZURE_OPENAI_API_BASE_PATH,
  streaming: true,
});

const coderMemory = new MemorySaver();

const coderPrompt = new SystemMessage(coderInstructions);
const coderFeedbackPrompt = new SystemMessage(feedbackCoderInstructions);

export const coderAgent = createReactAgent({
  llm: coderLLM,
  prompt: coderPrompt,
  tools: [],
  checkpointSaver: coderMemory,
});

export const coderFeedbackAgent = createReactAgent({
  llm: coderLLM,
  prompt: coderFeedbackPrompt,
  tools: [],
  checkpointSaver: coderMemory,
});

const langGraphConfig = {
  thread_id: "test-thread",
};

async function codeGenerator({
  messages,
}: {
  messages: { role: string; content: string }[];
}) {
  const response = await coderAgent.invoke(
    {
      messages,
    },
    { configurable: langGraphConfig },
  );
  const last_message = new HumanMessage({
    name: "coder",
    content: response.messages[response.messages.length - 1].content,
  });
  console.log("Last message from coder agent:", last_message.content);
  await fileBuilderAgentLLM({ last_message });
  return response;
}

async function feedbackCodeGenerator({
  messages,
}: {
  messages: { role: string; content: string }[];
}) {
  const response = await coderFeedbackAgent.invoke(
    {
      messages,
    },
    { configurable: langGraphConfig },
  );
  const last_message = new HumanMessage({
    name: "coder",
    content: response.messages[response.messages.length - 1].content,
  });
  await fileBuilderAgentLLM({ last_message });
  return response;
}

export async function startCodeGeneration({ history }: { history: Message[] }) {
  const messages = history.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  return await codeGenerator({ messages });
}

export async function addUserFeedbackToCodeGenerated({
  feedback,
}: {
  feedback: Feedback;
}) {
  const { code, message } = feedback;
  const messages = [
    {
      role: "user",
      content: message,
    },
    {
      role: "user",
      content: "The next Message is the entire component Code.",
    },
    code,
  ];
  console.log("message sent", messages);

  return await feedbackCodeGenerator({ messages });
}

export async function addGranularFeedbackToCodeGenerated({
  granularFeedback,
}: {
  granularFeedback: GranularFeedback;
}) {
  const { code, message, codeSnippet } = granularFeedback;
  const messages = [
    {
      role: "user",
      content: message,
    },
    {
      role: "user",
      content: "The next Message is the code snippet.",
    },
    {
      role: "user",
      content: codeSnippet,
    },
    {
      role: "user",
      content: "The next Message is the entire component Code.",
    },
    code,
  ];

  console.log("message sent", messages);
  return await feedbackCodeGenerator({ messages });
}
