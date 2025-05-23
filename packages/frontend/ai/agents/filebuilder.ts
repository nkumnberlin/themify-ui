import { AzureChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { fileBuilderInstructions } from "@/ai/instructions/filebuilder";
import { tools } from "@/ai/tools";

const fileBuilderLLm = new AzureChatOpenAI({
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

const fileBuilderPrompt = new SystemMessage(fileBuilderInstructions);

export const fileBuilderAgent = createReactAgent({
  llm: fileBuilderLLm,
  prompt: fileBuilderPrompt,
  tools: tools,
});

export async function fileBuilderAgentLLM({
  last_message,
}: {
  last_message: HumanMessage;
}) {
  return await fileBuilderAgent.invoke({
    messages: last_message,
  });
}

//
//   context of existing work
// danach sprache
