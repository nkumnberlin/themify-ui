import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AzureChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { findDataTagTool } from "@/ai/tools";
import { fileReaderInstructions } from "@/ai/agents/feedback/instructions/feedback-file-reader";

const feedbackFileReaderLLm = new AzureChatOpenAI({
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

const feedbackFileReaderPrompt = new SystemMessage(fileReaderInstructions);

export const feedbackFileReaderAgent = createReactAgent({
  llm: feedbackFileReaderLLm,
  prompt: feedbackFileReaderPrompt,
  tools: [findDataTagTool],
});

export async function getFeedbackFileReaderAgent({
  last_message,
}: {
  last_message: HumanMessage;
}) {
  return await feedbackFileReaderAgent.invoke({
    messages: last_message,
  });
}
