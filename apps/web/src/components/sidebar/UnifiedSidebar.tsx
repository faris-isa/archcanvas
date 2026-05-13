import React, { useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import { ChatSidebar } from "./ChatSidebar";
import { SuggestionSidebar } from "./SuggestionSidebar";
import { PropertyPanel } from "../canvas/PropertyPanel";
import {
  MessageSquare,
  Lightbulb,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useCanvasStore } from "../../store/useCanvasStore";
import { Shortcut } from "../common/Shortcut";

type SidebarTab = "chat" | "insights" | "properties";

export const UnifiedSidebar: React.FC = () => {
  const rightSidebarOpen = useCanvasStore((state) => state.rightSidebarOpen);
  const toggleRightSidebar = useCanvasStore((state) => state.toggleRightSidebar);
  const setRightSidebarOpen = useCanvasStore((state) => state.setRightSidebarOpen);
  const activeTab = useCanvasStore((state) => state.rightSidebarTab);
  const setActiveTab = useCanvasStore((state) => state.setRightSidebarTab);

  const isOpen = rightSidebarOpen;
  const setIsOpen = toggleRightSidebar;

  // Auto-open and switch to properties when a node is selected
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      if (nodes.length > 0) {
        setRightSidebarOpen(true);
        setActiveTab("properties");
      }
    },
  });

  return (
    <div
      className={`relative h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] transition-all duration-500 ease-in-out flex flex-shrink-0 ${
        isOpen ? "w-80" : "w-0"
      }`}
    >
      {/* Unified Toggle Handle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-32 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] border-r-0 rounded-l-lg flex flex-col items-center justify-center gap-4 group hover:bg-tech-accent/10 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.3)] z-10"
      >
        {isOpen ? (
          <ChevronRight
            size={16}
            className="text-[var(--color-text-secondary)] group-hover:text-tech-accent transition-colors"
          />
        ) : (
          <>
            <div className="flex flex-col items-center gap-1">
              <Sparkles size={10} className="text-industrial-gold" />
              <div className="w-1 h-1 bg-[var(--color-text-secondary)] rounded-full" />
              <Settings2 size={10} className="text-[var(--color-text-secondary)]" />
            </div>
            <ChevronLeft
              size={16}
              className="text-[var(--color-text-secondary)] group-hover:text-tech-accent transition-colors"
            />
          </>
        )}
      </button>

      {/* Sidebar Content */}
      <div
        className={`flex flex-col h-full w-80 overflow-hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/50">
          <button
            onClick={() => setActiveTab("chat")}
            className={`group flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2 ${
              activeTab === "chat"
                ? "border-tech-accent bg-tech-accent/5 text-tech-accent font-bold"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <MessageSquare size={16} />
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest">Chat</span>
              <Shortcut
                keys={["Alt", "1"]}
                className="opacity-0 group-hover:opacity-20 transition-opacity"
              />
            </div>
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`group flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2 ${
              activeTab === "insights"
                ? "border-industrial-gold bg-industrial-gold/5 text-industrial-gold font-bold"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Lightbulb size={16} />
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest">Insights</span>
              <Shortcut
                keys={["Alt", "2"]}
                className="opacity-0 group-hover:opacity-20 transition-opacity"
              />
            </div>
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`group flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2 ${
              activeTab === "properties"
                ? "border-tech-accent bg-tech-accent/5 text-tech-accent font-bold"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Settings2 size={16} />
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest">Props</span>
              <Shortcut
                keys={["Alt", "3"]}
                className="opacity-0 group-hover:opacity-20 transition-opacity"
              />
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && <ChatSidebar />}
          {activeTab === "insights" && <SuggestionSidebar forceOpen={true} />}
          {activeTab === "properties" && <PropertyPanel forceOpen={true} />}
        </div>
      </div>
    </div>
  );
};
