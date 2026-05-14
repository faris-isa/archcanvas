import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useCanvasStore } from "../../store/useCanvasStore";
import { apiClient } from "../../api/client";
import { RateLimitError } from "../../api/errors";
import { RateLimitToast } from "../common/RateLimitToast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedNodes?: any[];
  suggestedEdges?: any[];
}

export const ChatSidebar: React.FC = () => {
  const {
    nodes,
    edges,
    setCanvasState,
    chatMessages,
    addChatMessage,
    isChatTyping,
    setIsChatTyping,
  } = useCanvasStore();
  const selectedModel = useCanvasStore((s) => s.selectedModel);
  const [input, setInput] = useState("");
  const [rateLimitError, setRateLimitError] = useState<{ retryAfter?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatTyping]);

  const handleSend = async () => {
    if (!input.trim() || isChatTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    addChatMessage(userMsg);
    setInput("");
    setIsChatTyping(true);

    try {
      const updatedMessages = [...chatMessages, userMsg];
      const response = await apiClient.chat({
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        canvasState: { nodes, edges },
        model: selectedModel,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        suggestedNodes: response.suggestedNodes,
        suggestedEdges: response.suggestedEdges,
        timestamp: new Date(),
      };
      addChatMessage(assistantMsg);
    } catch (error) {
      console.error("Chat failed:", error);
      if (error instanceof RateLimitError) {
        setRateLimitError({ retryAfter: error.retryAfter });
      } else {
        const errorMsg: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting to the Engineering Council right now.",
          timestamp: new Date(),
        };
        addChatMessage(errorMsg);
      }
    } finally {
      setIsChatTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--color-bg-secondary)]">
      {/* Chat Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 flex-shrink-0">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Sparkles size={16} />
          Engineering Council AI
        </h2>
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
          Architectural consultation with our quad-persona panel
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" ref={scrollRef}>
        {chatMessages.map((msg) => (
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
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.suggestedNodes && (
                <button
                  onClick={() => setCanvasState(msg.suggestedNodes!, msg.suggestedEdges || [])}
                  className="mt-3 w-full py-2 px-3 bg-tech-accent/20 hover:bg-tech-accent/30 border border-tech-accent/50 rounded flex items-center justify-center gap-2 text-[10px] font-bold text-tech-accent transition-all"
                >
                  <Sparkles size={12} />
                  APPLY SUGGESTED LAYOUT
                </button>
              )}
            </div>
          </div>
        ))}
        {isChatTyping && (
          <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] opacity-50 italic">
            <Bot size={10} />
            The council is deliberating...
          </div>
        )}
        {rateLimitError && (
          <RateLimitToast
            retryAfter={rateLimitError.retryAfter}
            onDismiss={() => setRateLimitError(null)}
          />
        )}
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
            disabled={isChatTyping}
            placeholder={isChatTyping ? "Council is thinking..." : "Ask the council a question..."}
            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg py-2 pl-3 pr-10 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-tech-accent/50 transition-all resize-none h-20 placeholder:text-[var(--color-text-secondary)]/40 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isChatTyping || !input.trim()}
            className="absolute right-2 bottom-2 p-1.5 rounded-md bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:text-tech-accent hover:bg-tech-accent/10 transition-all disabled:opacity-30"
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
