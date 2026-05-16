import { ModelSelector } from "../canvas/ModelSelector";
import React from "react";
import { NodeLibrary } from "../sidebar/NodeLibrary";
import { AnalyzeButton } from "../canvas/AnalyzeButton";
import { ExportButton } from "../canvas/ExportButton";
import { SaveButton } from "../canvas/SaveButton";
import { UnifiedSidebar } from "../sidebar/UnifiedSidebar";
import { useCanvasStore } from "../../store/useCanvasStore";
import { ThemeToggle } from "../common/ThemeToggle";
import { useTheme } from "../../hooks/useTheme";
import { Undo2, Redo2, Copy, Clipboard } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    toggleLeftSidebar,
    toggleRightSidebar,
    setRightSidebarTab,
    setRightSidebarOpen,
    undo,
    redo,
    past,
    future,
    copyNodes,
    pasteNodes,
    clipboard,
  } = useCanvasStore();
  const { toggleTheme } = useTheme();
  const { getNodes } = useReactFlow();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when the user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Ctrl + Z = Undo (skip if typing)
      if (!isTyping && e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      // Ctrl + Y or Ctrl + Shift + Z = Redo (skip if typing)
      if (
        !isTyping &&
        ((e.ctrlKey && e.key.toLowerCase() === "y") ||
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        redo();
      }
      // Ctrl + C = Copy selected nodes (skip if typing)
      if (!isTyping && e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "c") {
        const selected = getNodes().filter((n) => n.selected) as any[];
        if (selected.length > 0) {
          e.preventDefault();
          copyNodes(selected);
        }
      }
      // Ctrl + V = Paste nodes (skip if typing)
      if (!isTyping && e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteNodes();
      }
      // Ctrl + B = Toggle Left Sidebar (Library)
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleLeftSidebar();
      }
      // Ctrl + Shift + B = Toggle Right Sidebar (Intelligence)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleRightSidebar();
      }
      // Ctrl + S = Save
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const buttons = Array.from(document.querySelectorAll("button"));
        const saveBtn = buttons.find((b) => b.textContent?.includes("Save"));
        if (saveBtn) saveBtn.click();
      }
      // Alt + 1, 2, 3 = Change Sidebar Tab
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setRightSidebarOpen(true);
        setRightSidebarTab("chat");
      }
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        setRightSidebarOpen(true);
        setRightSidebarTab("insights");
      }
      if (e.altKey && e.key === "3") {
        e.preventDefault();
        setRightSidebarOpen(true);
        setRightSidebarTab("properties");
      }
      // Ctrl + Shift + L = Toggle Theme
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleLeftSidebar, toggleRightSidebar, setRightSidebarTab, setRightSidebarOpen]);

  return (
    <div className="flex h-screen w-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-300">
      <NodeLibrary />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-14 border-b border-[var(--color-border)] flex items-center px-6 justify-between bg-[var(--color-bg-secondary)] transition-colors duration-300">
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
            <span className="text-tech-accent">Arch</span>Canvas
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Undo / Redo / Copy / Paste */}
            <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-md p-0.5">
              <button
                onClick={undo}
                disabled={past.length === 0}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 size={14} />
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Redo2 size={14} />
              </button>
              <div className="w-px h-4 bg-[var(--color-border)] mx-0.5" />
              <button
                onClick={() => {
                  const sel = getNodes().filter((n) => n.selected) as any[];
                  if (sel.length) copyNodes(sel);
                }}
                title="Copy selected nodes (Ctrl+C)"
                className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)] transition-all"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={pasteNodes}
                disabled={clipboard.length === 0}
                title="Paste (Ctrl+V)"
                className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Clipboard size={14} />
              </button>
            </div>
            <ModelSelector />
            <AnalyzeButton />
            <ExportButton />
            <SaveButton />
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden h-full">{children}</div>
      </main>
      <UnifiedSidebar />
    </div>
  );
};
