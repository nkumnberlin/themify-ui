import { NextResponse } from "next/server";
import { humanMessageInput } from "@/ai/architect";
import { IterableReadableStream } from "@langchain/core/utils/stream";

function streamIterableReadAbleStream(stream: IterableReadableStream<string>) {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: Request) {
  const { content } = await req.json();

  const stream = await humanMessageInput({ content });
  // return streamIterableReadAbleStream(stream)
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        // Add newline as a delimiter between JSON chunks
        const serialized = JSON.stringify(chunk);
        controller.enqueue(encoder.encode(serialized + "\n"));
      }
      controller.close();
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
