import { AzureChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { fileReaderInstructions } from "@/ai/instructions/file-reader";
import { readFilesTool } from "@/ai/tools";
import { locationBasedComponentFinderInstructions } from "@/ai/instructions/location-finder";

const fileReaderLLm = new AzureChatOpenAI({
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

const fileReaderPrompt = new SystemMessage(fileReaderInstructions);

export const fileReaderAgent = createReactAgent({
  llm: fileReaderLLm,
  prompt: fileReaderPrompt,
  tools: [readFilesTool],
});

const locationFinderPrompt = new SystemMessage(
  locationBasedComponentFinderInstructions,
);

export const locationFinderAgent = createReactAgent({
  llm: fileReaderLLm,
  prompt: locationFinderPrompt,
  tools: [readFilesTool],
});

export async function fileReaderAgentLLM({
  last_message,
}: {
  last_message: HumanMessage;
}) {
  return await fileReaderAgent.invoke({
    messages: last_message,
  });
}

export async function readFilesFromPath({ message }: { message: string }) {
  const last_message = new HumanMessage({
    name: "user",
    content: message,
  });
  return await fileReaderAgentLLM({ last_message });
}

export async function locationFinderAgentLLLm({
  last_message,
}: {
  last_message: HumanMessage;
}) {
  return await locationFinderAgent.invoke({
    messages: last_message,
  });
}

export async function readFilesFromPathWithLocation({
  message,
}: {
  message: string;
}) {
  const last_message = new HumanMessage({
    name: "agent",
    content: message,
  });
  return await locationFinderAgentLLLm({ last_message });
}
