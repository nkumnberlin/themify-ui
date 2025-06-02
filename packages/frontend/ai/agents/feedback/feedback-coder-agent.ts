import { GranularFeedback } from "@/ai/interface";
import { getFeedbackFileReaderAgent } from "@/ai/agents/feedback/feedback-file-reader-agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { AzureChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { feedbackCoderInstructions } from "@/ai/agents/feedback/instructions/feedback-coder";
import { updateFeedbackedComponentTool } from "@/ai/tools";

const feedbackCoderLLM = new AzureChatOpenAI({
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

const feedbackCoderMemory = new MemorySaver();

const feedbackCoderPrompt = new SystemMessage(feedbackCoderInstructions);

export const feedbackCoderAgent = createReactAgent({
  llm: feedbackCoderLLM,
  prompt: feedbackCoderPrompt,
  tools: [updateFeedbackedComponentTool],
  checkpointSaver: feedbackCoderMemory,
});

const langGraphConfig = {
  thread_id: "test-thread",
};

export async function addGranularFeedbackToCodeGenerated({
  granularFeedback,
}: {
  granularFeedback: GranularFeedback;
}) {
  const { message, dataBlockId } = granularFeedback;
  const feedbackFileReaderResponse = await getFeedbackFileReaderAgent({
    last_message: new HumanMessage({
      name: "user",
      content: `Give me the code for this data-block-id: ${dataBlockId}.`,
    }),
  });

  const code =
    feedbackFileReaderResponse.messages[
      feedbackFileReaderResponse.messages.length - 1
    ].content;
  // get code for dataBlockId.
  // pass the code as message to the agent with the change request.

  const messages = [
    {
      role: "user",
      content: message,
    },
    {
      role: "user",
      content: `The next Message is the entire component Code. Only change the code in the next message and only the component with this data-block-id: ${dataBlockId}`,
    },
    {
      role: "user",
      content: code,
    },
  ];
  console.log("code", messages);
  const response = await feedbackCoderAgent.invoke(
    {
      messages,
    },
    { configurable: langGraphConfig },
  );
  console.log(
    "response",
    response.messages[response.messages.length - 1].content,
  );
  return response;
  // console.log("message sent", messages);
  // return await feedbackCodeGenerator({ messages });
}
