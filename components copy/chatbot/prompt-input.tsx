"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function PromptInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit(e);
          }
        }}
        placeholder="Ask about cluster status, a migration, or a risk score…"
        rows={1}
        className="min-h-11 flex-1 resize-none"
      />
      <Button type="submit" size="icon" disabled={disabled || !value.trim()}>
        <Send className="size-4" />
      </Button>
    </form>
  );
}
