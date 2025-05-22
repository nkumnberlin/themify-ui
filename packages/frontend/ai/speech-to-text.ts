"use server";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY!);

export async function speechToText({ file }: { file: File }) {
  const output = await client.automaticSpeechRecognition({
    data: file,
    model: "openai/whisper-large-v3",
    provider: "hf-inference",
  });
  console.log(output);
  return output;
}
