"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "What is your current role?",
  "Tell me about your experience at ANRPC",
  "What are your key skills?",
  "What is your educational background?",
];

const WELCOME_TEXT =
  "Hi — I'm Khaled's career assistant. Ask me anything about his operations leadership, experience, skills, or education.";

export function CareerChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_TEXT },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Finding 5 — cancel in-flight request when chat closes or component unmounts
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // Finding 5 — enforce client-side length cap before sending
    if (trimmed.length > 4000) {
      setError("Message is too long. Please keep it under 4000 characters.");
      return;
    }

    setError(null);
    const userMessage: Message = { role: "user", content: trimmed };

    const apiMessages = [...messages, userMessage].filter(
      (m) => !(m.role === "assistant" && m.content === WELCOME_TEXT),
    );

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Finding 5 — abort any previous in-flight request, then create a fresh controller
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const raw = await res.text();
      let data: { message?: string; error?: string } = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          res.ok
            ? "Invalid response from server."
            : `Server error (${res.status}). Restart with: npm run dev:clean`,
        );
      }

      if (!res.ok) {
        throw new Error(
          data.error ??
            (res.status === 500
              ? "Server error — check OPENROUTER_API_KEY in .env and restart the dev server."
              : `Request failed (${res.status}).`),
        );
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message ?? "No response." },
      ]);
    } catch (err) {
      // Finding 5 — silently ignore aborts (user closed the chat)
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Failed to send message.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // Finding 6 — !error guard prevents suggestions rendering alongside an error banner
  const showSuggestions =
    messages.length === 1 &&
    messages[0].role === "assistant" &&
    messages[0].content === WELCOME_TEXT &&
    !error;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-sm border border-accent/40 bg-accent text-void shadow-[0_0_32px_-8px_var(--color-accent)] transition-all hover:scale-105 hover:shadow-[0_0_48px_-8px_var(--color-accent)]"
        aria-label={open ? "Close career chat" : "Open career chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[min(100vw-3rem,400px)] flex-col overflow-hidden rounded-sm border border-border/80 bg-surface shadow-2xl"
          role="dialog"
          aria-label="Career assistant chat"
        >
          <div className="flex items-center gap-3 border-b border-border/60 bg-elevated/80 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent/15 text-accent">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-[family-name:var(--font-display)] text-sm font-bold">
                Career Assistant
              </p>
              <p className="truncate text-xs text-muted">Ask about Khaled&apos;s career</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex max-h-[min(60vh,420px)] flex-1 flex-col gap-3 overflow-y-auto p-4"
          >
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}-${msg.content.slice(0, 12)}`}
                className={`max-w-[90%] rounded-sm px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-accent/20 text-foreground"
                    : "mr-auto border border-border/50 bg-elevated/60 text-foreground/90"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto max-w-[90%] rounded-sm border border-border/50 bg-elevated/60 px-3 py-2 text-sm text-muted">
                Thinking…
              </div>
            )}
            {error && (
              <p className="rounded-sm border border-warm/30 bg-warm/10 px-3 py-2 text-xs text-warm">
                {error}
              </p>
            )}
          </div>

          {showSuggestions && !loading && (
            <div className="flex flex-wrap gap-2 border-t border-border/40 px-4 py-3">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-sm border border-border/60 bg-elevated/50 px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-border/60 p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about my career…"
              rows={1}
              disabled={loading}
              className="max-h-24 min-h-[40px] flex-1 resize-none rounded-sm border border-border/60 bg-void px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-accent text-void transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
