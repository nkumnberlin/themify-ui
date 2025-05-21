"use server";
import { AzureChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { coderInstructions } from "@/ai/instructions/coder";
import { Message } from "@/app/page";

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

const coderAgent = createReactAgent({
  llm: coderLLM,
  // https://js.langchain.com/docs/how_to/migrate_agent prompt templates. check
  prompt: coderPrompt,
  tools: [],
  checkpointSaver: coderMemory,
});

const langGraphConfig = {
  thread_id: "test-thread",
};

export async function coderAgentLLM({ history }: { history: Message[] }) {
  const messages = history.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  return await coderAgent.stream(
    {
      messages,
    },
    { streamMode: "updates", configurable: langGraphConfig },
  );
}
