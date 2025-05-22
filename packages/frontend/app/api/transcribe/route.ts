import { NextRequest, NextResponse } from "next/server";
import { speechToText } from "@/ai/speech-to-text";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("audio");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No audio uploaded" }, { status: 400 });
  }
  try {
    const output = await speechToText({ file });
    return NextResponse.json({ text: output.text });
  } catch (error) {
    console.error("Transcription failed:", error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 },
    );
  }
}
