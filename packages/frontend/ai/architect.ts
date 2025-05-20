"use server";
import { AzureChatOpenAI } from "@langchain/openai";
import { architectInstruction } from "@/ai/instructions/architect";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { coderInstructions } from "@/ai/instructions/coder";

const architectLLM = new AzureChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY, // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION, // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  azureOpenAIBasePath:
    "https://nicholas-llm.openai.azure.com/openai/deployments",
  streaming: true,
});

const coderLLM = new AzureChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY, // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME, // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION, // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  azureOpenAIBasePath:
    "https://nicholas-llm.openai.azure.com/openai/deployments",
  streaming: true,
});

const architectMemory = new ConversationSummaryBufferMemory({
  llm: architectLLM,
  maxTokenLimit: 1000,
  returnMessages: true,
});

const architectPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(architectInstruction),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

// const chain = new ConversationChain({
//   llm: llm,
//   prompt: architectPrompt,
//   memory: architectMemory,
// });

const architectAgent = new ConversationChain({
  llm: architectLLM,
  prompt: architectPrompt,
  memory: architectMemory,
});

const coderMemory = new ConversationSummaryBufferMemory({
  llm: coderLLM,
  maxTokenLimit: 1000,
  returnMessages: true,
  chatHistory: architectMemory.chatHistory,
});

const coderPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(coderInstructions),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const coderAgent = new ConversationChain({
  llm: coderLLM,
  prompt: coderPrompt,
  memory: coderMemory,
});

async function handleUserInput(input: string) {
  const response = await coderAgent.stream({ input });

  return response;
}

export async function humanMessageInput({ content }: { content: string }) {
  return await handleUserInput(content);
}
