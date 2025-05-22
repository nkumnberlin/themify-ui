import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { content, llmType, history, feedback } = await req.json();
  if (llmType === "architect" && content) {
  }
  return new NextResponse(lastMessage, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
