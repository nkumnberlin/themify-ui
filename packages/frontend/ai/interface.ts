import { Message } from "@/app/page";

export type LLMType = "coder" | "architect";

export interface StructuredResponse {
  structuredResponse: {
    tsx: string;
  };
}
export type Feedback = {
  message: string;
  code: Message[];
};

export interface AgentData {
  agent: {
    messages: AgentMessage[];
  };
}

interface AgentMessage {
  lc: number;
  type: string;
  id: string[]; // ["langchain_core", "messages", "AIMessageChunk"]
  kwargs: AgentMessageKwargs;
}

interface AgentMessageKwargs {
  content: string;
  additional_kwargs: Record<string, unknown>;
  response_metadata: ResponseMetadata;
  tool_call_chunks: any[]; // No type details given, so using 'any'
  id: string;
  usage_metadata: UsageMetadata;
  tool_calls: any[];
  invalid_tool_calls: any[];
}

interface ResponseMetadata {
  estimatedTokenUsage: EstimatedTokenUsage;
  prompt: number;
  completion: number;
  finish_reason: string;
  system_fingerprint: string;
  model_name: string;
  usage: Usage;
}

interface EstimatedTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface Usage {
  completion_tokens: number;
  completion_tokens_details: CompletionTokensDetails;
  prompt_tokens: number;
  prompt_tokens_details: PromptTokensDetails;
  total_tokens: number;
}

interface CompletionTokensDetails {
  accepted_prediction_tokens: number;
  audio_tokens: number;
  reasoning_tokens: number;
  rejected_prediction_tokens: number;
}

interface PromptTokensDetails {
  audio_tokens: number;
  cached_tokens: number;
}

interface UsageMetadata {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  input_token_details: InputTokenDetails;
  output_token_details: OutputTokenDetails;
}

interface InputTokenDetails {
  audio: number;
  cache_read: number;
}

interface OutputTokenDetails {
  audio: number;
  reasoning: number;
}
