import { NextResponse } from "next/server";
import { startCodeGeneration } from "@/ai/agents/coder";

export async function POST(req: Request) {
  const { content, llmType, history, feedback, granularFeedback } =
    await req.json();

  let stream = undefined;
  if (llmType === "coder" && history) {
    stream = await startCodeGeneration({ history });
  }
  const lastMessage = JSON.stringify(
    stream.messages[stream.messages.length - 1].content,
  );

  return new NextResponse(lastMessage, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
