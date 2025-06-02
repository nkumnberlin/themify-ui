"use server";
import { AzureChatOpenAI } from "@langchain/openai";
import { architectInstruction } from "@/ai/agents/instructions/architect";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";

const architectLLM = new AzureChatOpenAI({
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

const architectMemory = new MemorySaver();

const architectPrompt = new SystemMessage(architectInstruction);

const architectAgent = createReactAgent({
  llm: architectLLM,
  // https://js.langchain.com/docs/how_to/migrate_agent prompt templates. check
  prompt: architectPrompt,
  tools: [],
  checkpointSaver: architectMemory,
});

const langGraphConfig = {
  thread_id: "test-thread",
};

async function handleUserInput(input: string) {
  return await architectAgent.stream(
    {
      messages: [{ role: "user", content: input }],
    },
    { streamMode: "updates", configurable: langGraphConfig },
  );
}

export async function architectAgentLLM({ content }: { content: string }) {
  return await handleUserInput(content);
}
