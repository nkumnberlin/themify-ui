"use server";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// tavilyApiKey: process.env.TAVILY_API_KEY,
console.log("123123", process.env.TAVILY_API_KEY);
const tavilySearch = new TavilySearch({
  maxResults: 3,
  tavilyApiKey: process.env.TAVILY_API_KEY,
});
const getWeather = tool(
  (input) => {
    if (["sf", "san francisco"].includes(input.location.toLowerCase())) {
      return "It's 60 degrees and foggy.";
    } else {
      return "It's 90 degrees and sunny.";
    }
  },
  {
    name: "get_weather",
    description: "Call to get the current weather.",
    schema: z.object({
      location: z.string().describe("Location to get the weather for."),
    }),
  },
);
console.log("was", process.env.OPENROUTER_API_KEY);

const llm = new ChatOpenAI({
  // model: "qwen/qwen3-235b-a22b:free",
  model: "google/gemma-3-27b-it:free",
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});

const agentCheckpointer = new MemorySaver();

const agent = createReactAgent({
  llm: llm,
  tools: [getWeather],
  // checkpointSaver: agentCheckpointer,
});

export async function humanMessageInput({ content }: { content: string }) {
  console.log("was was ");
  // const inputs = [new HumanMessage(content)];
  return await llm.stream([
    new SystemMessage(
      "You are an senior software architect and wants to help the user. Describe how to implement it in detail. KISS and DRY. Don't use code. Only explain the logic.",
    ),
    new HumanMessage(content),
  ]);
  // return await agent.stream(inputs, { streamMode: "values" });
}
