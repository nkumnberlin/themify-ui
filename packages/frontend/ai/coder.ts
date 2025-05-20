"use server";
import { AzureChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { coderInstructions } from "@/ai/instructions/coder";
import { z } from "zod";

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

const TSXComponentSchema = z.object({
  tsx: z
    .string()
    .describe(
      "Complete TSX code for a React component, including imports, JSX, and Tailwind CSS classes.",
    ),
});

const responseFormat = [
  "You are a code generation agent. Respond ONLY with valid TSX code for a React component. Do not include any explanations or additional text.",
  TSXComponentSchema,
] as const;

const coderAgent = createReactAgent({
  llm: coderLLM,
  // https://js.langchain.com/docs/how_to/migrate_agent prompt templates. check
  prompt: coderPrompt,
  tools: [],
  checkpointSaver: coderMemory,
  responseFormat,
});

const langGraphConfig = {
  thread_id: "test-thread",
};

async function handleUserInput(input: string) {
  return await coderAgent.stream(
    {
      messages: [{ role: "user", content: input }],
    },
    { streamMode: "updates", configurable: langGraphConfig },
  );
}

export async function coderAgentLLM({ content }: { content: string }) {
  return await handleUserInput(content);
}
