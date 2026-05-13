import React, { useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ChatSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I am your IIoT Pipeline Architect. How can I help you design your industrial data flow today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMsg]);
    setInput("");

    // Mock response for now
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm analyzing your request. Since we're in an industrial context, I'd recommend ensuring your Edge Gateways are using OPC-UA for reliable field connectivity.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--color-bg-secondary)]">
      {/* Chat Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 flex-shrink-0">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Sparkles size={16} />
          Architect AI
        </h2>
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
          Intent-driven design assistance
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-lg text-[11px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-tech-accent/20 border border-tech-accent/30 text-[var(--color-text-primary)]"
                  : "bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-50 text-[9px] uppercase font-bold">
                {msg.role === "user" ? <User size={10} /> : <Bot size={10} />}
                {msg.role}
              </div>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/30">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe your intent..."
            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg py-2 pl-3 pr-10 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-tech-accent/50 transition-all resize-none h-20 placeholder:text-[var(--color-text-secondary)]/40"
          />
          <button
            onClick={handleSend}
            className="absolute right-2 bottom-2 p-1.5 rounded-md bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:text-tech-accent hover:bg-tech-accent/10 transition-all"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[9px] text-[var(--color-text-secondary)] opacity-50 mt-2 text-center">
          Press Enter to send. Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
};
