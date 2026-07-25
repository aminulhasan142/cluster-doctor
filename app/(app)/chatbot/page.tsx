"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";

import { useChat } from "@/hooks/use-chat";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/chatbot/message-bubble";
import { PromptInput } from "@/components/chatbot/prompt-input";

const QUICK_PROMPTS = [
  "What is the current cluster status?",
  "Why was a migration triggered recently?",
  "Why was a particular node selected as a safe target?",
  "Explain the risk score for the highest-risk node.",
  "Explain the latest recovery confirmation.",
  "Explain the Twin Reality Gap for a node.",
];

export default function ChatbotPage() {
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <PageHeader title="AI Chat" description="Ask the AI assistant about cluster status, predictions, and past actions." />

      <Card className="glass-panel flex h-[calc(100vh-13rem)] flex-col gap-0 overflow-hidden">
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--ai)]/10">
                  <Bot className="size-6 text-[var(--ai)]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ask Cluster AI Doctor anything</p>
                  <p className="text-sm text-muted-foreground">
                    Cluster health, migrations, risk, recovery, or the Digital Twin.
                  </p>
                </div>
                <div className="flex max-w-xl flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(prompt)}
                      className="h-auto whitespace-normal py-1.5 text-left text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--ai)]" />
                Thinking…
              </div>
            )}
          </div>
          <div className="border-t border-border/60 p-4">
            <PromptInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
