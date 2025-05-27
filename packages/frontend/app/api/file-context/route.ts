import { NextResponse } from "next/server";
import { readFilesFromPath } from "@/ai/agents/file-reader";

export async function POST(req: Request) {
  const { message } = await req.json();

  let stream = undefined;
  if (message) {
    stream = await readFilesFromPath({ message });
  }
  if (!stream || !stream.messages || stream.messages.length === 0) {
    return new NextResponse("No messages found", {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-transform",
      },
    });
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
