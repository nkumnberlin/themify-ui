import { AzureChatOpenAI } from "@langchain/openai";
import { SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Message } from "@/app/page";
import { fileBuilderInstructions } from "@/ai/instructions/filebuilder";

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

const fileBuilderAgent = createReactAgent({
  llm: fileBuilderLLm,
  // https://js.langchain.com/docs/how_to/migrate_agent prompt templates. check
  prompt: fileBuilderPrompt,
  tools: [],
});

export async function fileBuilderAgentLLM({ history }: { history: Message[] }) {
  const messages = history.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  return await fileBuilderAgent.stream(
    {
      messages,
    },
    { streamMode: "updates" },
  );
}
