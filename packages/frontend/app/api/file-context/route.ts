import { NextResponse } from "next/server";
import { readFilesFromPathWithLocation } from "@/ai/agents/file-reader";
import { addGranularFeedbackToCodeGenerated } from "@/ai/agents/coder";
import { Message } from "@/app/ai-assistant";

export async function POST(req: Request) {
  const { message, codeSnippet, granularFeedback, changeRequest } =
    await req.json();

  let stream = undefined;
  if (message) {
    stream = await readFilesFromPathWithLocation({ message });
  }
  if (codeSnippet && message) {
    stream = await readFilesFromPathWithLocation({ message });
    const lastMessage = JSON.stringify(
      stream.messages[stream.messages.length - 1].content,
    );
    const _lastMessage: Message = {
      id: Date.now(),
      role: "user",
      content: lastMessage,
      isLoading: false,
    } satisfies Message;
    console.log('"_lastMessage", _lastMessage');

    stream = await addGranularFeedbackToCodeGenerated({
      granularFeedback: {
        code: _lastMessage,
        message: message,
        codeSnippet: codeSnippet,
      },
    });
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
  console.log("WHAT HAPPENS MAN", lastMessage);
  // stream = await readFilesFromPath({
  //   message: tmpMessage,
  // });
  //
  // const lastMessage = JSON.stringify(
  //   stream.messages[stream.messages.length - 1].content,
  // );

  return new NextResponse(lastMessage, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
