"use client";

import { useCallback, useState } from "react";

import { chatbotService } from "@/services/chatbot.service";
import type { ChatMessage } from "@/types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (question: string) => {
      try {
        setLoading(true);
        setError(null);

        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: question,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        const history = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const answer = await chatbotService.send({ question, history });

        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: answer.answer,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        return answer;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, isLoading, error, sendMessage, clearChat };
}
