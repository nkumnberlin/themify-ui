import { InferenceClient } from "@huggingface/inference";
import fs from "fs";

const client = new InferenceClient("hf_xxxxxxxxxxxxxxxxxxxxxxxx");

const data = fs.readFileSync("sample1.flac");

export async function speechToText() {
  const output = await client.automaticSpeechRecognition({
    data,
    model: "openai/whisper-large-v3",
    provider: "fal-ai",
  });
  console.log(output);
}
