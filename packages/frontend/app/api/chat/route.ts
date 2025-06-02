import { NextResponse } from "next/server";
import { architectAgentLLM } from "@/ai/agents/architect";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import {
  addUserFeedbackToCodeGenerated,
  startCodeGeneration,
} from "@/ai/agents/coder";
import { addGranularFeedbackToCodeGenerated } from "@/ai/agents/feedback/feedback-coder-agent";

export async function POST(req: Request) {
  const { content, llmType, history, feedback, granularFeedback } =
    await req.json();
  if (llmType === "architect" && content) {
    const stream = await architectAgentLLM({ content });
    const readableStream = streamIterableReadAbleStream(stream);

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }
  let stream = undefined;
  if (llmType === "coder" && history) {
    stream = await startCodeGeneration({ history });
  }
  if (llmType === "coder" && granularFeedback) {
    console.log("geht hier rein_________");
    stream = await addGranularFeedbackToCodeGenerated({ granularFeedback });
  }
  if (llmType === "coder" && feedback) {
    stream = await addUserFeedbackToCodeGenerated({ feedback });
  }
  if (!stream) {
    return null;
  }
  const lastMessage = JSON.stringify(
    stream.messages[stream.messages.length - 1].content,
  );
  if (!lastMessage) {
    return null;
  }
  console.log("Last message:_", lastMessage);
  return new NextResponse(lastMessage, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

function streamIterableReadAbleStream(stream: IterableReadableStream<string>) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        // Add newline as a delimiter between JSON chunks
        const serialized = JSON.stringify(chunk);
        controller.enqueue(encoder.encode(serialized + "\n"));
      }
      controller.close();
    },
  });
}
