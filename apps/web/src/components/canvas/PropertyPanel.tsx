import React, { useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import { useCanvasStore } from "../../store/useCanvasStore";
import type { ArchNodeData, IntentProperty } from "@archcanvas/shared";
import { ChevronLeft, ChevronRight, Settings2, X } from "lucide-react";

interface PropertyPanelProps {
  forceOpen?: boolean;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ forceOpen }) => {
  const [selectedNode, setSelectedNode] = React.useState<Node<ArchNodeData> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const effectiveOpen = forceOpen || isOpen;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const node = (nodes[0] as Node<ArchNodeData>) || null;
      setSelectedNode(node);
      // Auto-open when a node is selected
      if (node) setIsOpen(true);
    },
  });

  const onPropertyChange = (prop: IntentProperty, value: string) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, {
      intentProperties: {
        ...selectedNode.data.intentProperties,
        [prop]: value as any,
      },
    });
  };

  return (
    <div
      className={`relative h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] transition-all duration-500 ease-in-out flex flex-shrink-0 ${
        effectiveOpen ? "w-80" : "w-0"
      }`}
    >
      {/* Toggle Handle (The "Folder" Tab) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-24 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] border-r-0 rounded-l-lg flex items-center justify-center group hover:bg-[var(--color-bg-primary)] transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.3)] z-10"
        title={isOpen ? "Collapse Properties" : "Expand Properties"}
      >
        {isOpen ? (
          <ChevronRight
            size={16}
            className="text-[var(--color-text-secondary)] group-hover:text-tech-accent transition-colors"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Settings2 size={12} className="text-industrial-gold" />
            <ChevronLeft
              size={16}
              className="text-[var(--color-text-secondary)] group-hover:text-tech-accent transition-colors"
            />
          </div>
        )}
      </button>

      {/* Main Content */}
      <div
        className={`flex flex-col h-full w-80 overflow-hidden transition-opacity duration-300 ${
          effectiveOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {!selectedNode ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center mb-4 border border-[var(--color-border)]">
              <Settings2 className="w-8 h-8 text-[var(--color-text-secondary)] opacity-20" />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
              No Selection
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed px-4">
              Select a node on the canvas to configure its intent properties.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 flex-shrink-0 relative">
              <div className="flex flex-col gap-1 pr-8">
                <span className="text-[10px] uppercase tracking-widest text-tech-accent font-black">
                  Node Configuration
                </span>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] leading-tight">
                  {selectedNode.data.label}
                </h2>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {selectedNode.data.category}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-[var(--color-border)]">
              {(
                Object.entries(selectedNode.data.intentProperties) as [IntentProperty, string][]
              ).map(([prop, value]) => (
                <div key={prop} className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center justify-between uppercase tracking-wider">
                    {prop.replace("-", " ")}
                    <span className="text-[9px] px-1.5 py-0.5 bg-[var(--color-bg-primary)] rounded border border-[var(--color-border)] text-tech-accent font-mono">
                      INTENT
                    </span>
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {getOptionsForProp(prop).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => onPropertyChange(prop, opt)}
                        className={`py-2 text-[10px] font-bold rounded border transition-all uppercase tracking-widest ${
                          value === opt
                            ? "bg-tech-accent border-tech-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                            : "bg-[var(--color-bg-primary)]/40 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-tech-accent/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t border-[var(--color-border)] opacity-50">
                <h4 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-3 tracking-widest">
                  Technical Metadata
                </h4>
                <div className="bg-[var(--color-bg-primary)]/60 p-4 rounded-lg border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-secondary)] space-y-2">
                  <div className="flex justify-between">
                    <span>ID</span>{" "}
                    <span className="text-[var(--color-text-secondary)] opacity-70">
                      {selectedNode.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TYPE</span>{" "}
                    <span className="text-[var(--color-text-secondary)] opacity-70">
                      {selectedNode.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>COORD</span>{" "}
                    <span className="text-[var(--color-text-secondary)] opacity-70">
                      X={Math.round(selectedNode.position.x)}, Y=
                      {Math.round(selectedNode.position.y)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getOptionsForProp(prop: IntentProperty): string[] {
  switch (prop) {
    case "throughput-rate":
      return ["low", "medium", "high"];
    case "environment":
      return ["edge", "cloud", "on-premise"];
    case "latency-tolerance":
      return ["low", "medium", "high"];
    case "network-reliability":
      return ["stable", "unstable", "volatile"];
    case "power-source":
      return ["battery", "mains", "poe"];
    case "sampling-rate":
      return ["milliseconds", "seconds", "minutes"];
    case "connectivity":
      return ["ethernet", "wifi", "cellular", "lorawan"];
    case "storage-tier":
      return ["hot", "warm", "cold", "archive"];
    case "redundancy":
      return ["none", "n+1", "2n"];
    default:
      return [];
  }
}
