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
    <div className="flex flex-col h-full bg-tech-gray">
      {/* Chat Header */}
      <div className="p-4 border-b border-industrial-gray bg-industrial-gray/20">
        <h2 className="text-sm font-bold text-industrial-gold flex items-center gap-2">
          <Sparkles size={16} />
          Architect AI
        </h2>
        <p className="text-[10px] text-industrial-gray mt-1">Intent-driven design assistance</p>
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
                  ? "bg-tech-accent/20 border border-tech-accent/30 text-gray-200"
                  : "bg-industrial-gray/20 border border-industrial-gray text-gray-300"
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
      <div className="p-4 border-t border-industrial-gray bg-industrial-gray/5">
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
            className="w-full bg-tech-gray/50 border border-industrial-gray rounded-lg py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-industrial-gold/50 transition-all resize-none h-20 placeholder:text-gray-600"
          />
          <button
            onClick={handleSend}
            className="absolute right-2 bottom-2 p-1.5 rounded-md bg-industrial-gray/50 text-industrial-gray hover:text-industrial-gold hover:bg-industrial-gold/10 transition-all"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[9px] text-gray-600 mt-2 text-center">
          Press Enter to send. Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
};
