import React from 'react';
import { NodeLibrary } from '../sidebar/NodeLibrary';
import { AnalyzeButton } from '../canvas/AnalyzeButton';
import { SaveButton } from '../canvas/SaveButton';
import { UnifiedSidebar } from '../sidebar/UnifiedSidebar';
import { useCanvasStore } from '../../store/useCanvasStore';

import { ThemeToggle } from '../common/ThemeToggle';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { toggleLeftSidebar, toggleRightSidebar } = useCanvasStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + B = Toggle Left Sidebar (Library)
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleLeftSidebar();
      }
      // Ctrl + Shift + B = Toggle Right Sidebar (Intelligence)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleRightSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftSidebar, toggleRightSidebar]);

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
            <AnalyzeButton />
            <SaveButton />
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden h-full">
          {children}
        </div>

      </main>
      <UnifiedSidebar />
    </div>
  );
};
