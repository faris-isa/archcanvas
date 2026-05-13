import { ModelSelector } from "../canvas/ModelSelector";
import React from "react";
import { NodeLibrary } from "../sidebar/NodeLibrary";
import { AnalyzeButton } from "../canvas/AnalyzeButton";
import { SaveButton } from "../canvas/SaveButton";
import { UnifiedSidebar } from "../sidebar/UnifiedSidebar";
import { useCanvasStore } from "../../store/useCanvasStore";

import { ThemeToggle } from "../common/ThemeToggle";
import { useTheme } from "../../hooks/useTheme";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { toggleLeftSidebar, toggleRightSidebar, setRightSidebarTab, setRightSidebarOpen } =
    useCanvasStore();
  const { toggleTheme } = useTheme();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
            <ModelSelector />
            <AnalyzeButton />
            <SaveButton />
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden h-full">{children}</div>
      </main>
      <UnifiedSidebar />
    </div>
  );
};
