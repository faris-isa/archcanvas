import React from 'react';
import { NodeLibrary } from '../sidebar/NodeLibrary';
import { AnalyzeButton } from '../canvas/AnalyzeButton';
import { SaveButton } from '../canvas/SaveButton';
import { PropertyPanel } from '../canvas/PropertyPanel';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-tech-dark text-gray-200">
      <NodeLibrary />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-14 border-b border-industrial-gray flex items-center px-6 justify-between bg-tech-gray">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-tech-accent">Arch</span>Canvas
          </h1>
          <div className="flex items-center gap-4">
            <AnalyzeButton />
            <SaveButton />
          </div>
        </header>
        {children}
      </main>
      <PropertyPanel />
    </div>
  );
};
