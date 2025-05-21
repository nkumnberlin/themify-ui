import { NextResponse } from "next/server";
import { architectAgentLLM } from "@/ai/architect";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { startCodeGeneration } from "@/ai/coder";

export async function POST(req: Request) {
  const { content, llmType, history } = await req.json();
  let stream;
  console.log("llmType", llmType);
  if (llmType === "coder") {
    stream = await startCodeGeneration({ history });
  }
  if (llmType === "architect") {
    stream = await architectAgentLLM({ content });
  }
  if (!stream) {
    return null;
  }

  const readableStream = streamIterableReadAbleStream(stream);

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
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
