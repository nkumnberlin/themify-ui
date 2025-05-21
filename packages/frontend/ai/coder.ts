import { AzureChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { coderInstructions } from "@/ai/instructions/coder";
import { Message } from "@/app/page";
import { fileBuilderAgentLLM } from "@/ai/filebuilder";

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

export const coderAgent = createReactAgent({
  llm: coderLLM,
  prompt: coderPrompt,
  tools: [],
  checkpointSaver: coderMemory,
});

const langGraphConfig = {
  thread_id: "test-thread",
};

export async function startCodeGeneration({ history }: { history: Message[] }) {
  const messages = history.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  const response = await coderAgent.invoke(
    {
      messages,
    },
    { configurable: langGraphConfig },
  );
  console.log(
    "last response",
    response.messages[response.messages.length - 1].content,
  );
  const last_message = new HumanMessage({
    name: "coder",
    content: response.messages[response.messages.length - 1].content,
  });

  return fileBuilderAgentLLM({ last_message });
}
