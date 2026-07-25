export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ChatHistoryItem {
  role: string;
  content: string;
}

export interface ChatRequestPayload {
  question: string;
  history?: ChatHistoryItem[];
  cluster?: unknown;
  node?: unknown;
  telemetry?: unknown;
  prediction?: unknown;
}

export interface ChatAnswer {
  answer: string;
  confidence: number | null;
  sources: string[];
}
