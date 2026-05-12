import React from 'react';
import { useOnSelectionChange } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { ArchNodeData, IntentProperty } from '@archcanvas/shared';

export const PropertyPanel: React.FC = () => {
  const [selectedNode, setSelectedNode] = React.useState<Node<ArchNodeData> | null>(null);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNode((nodes[0] as Node<ArchNodeData>) || null);
    },
  });

  if (!selectedNode) {
    return (
      <div className="w-80 bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] p-6 flex flex-col items-center justify-center text-center transition-colors duration-300">
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center mb-4 border border-[var(--color-border)]">
          <svg className="w-8 h-8 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">No Selection</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">Select a node on the canvas to configure its intent properties.</p>
      </div>
    );
  }

  const archData = selectedNode.data;

  const onPropertyChange = (prop: IntentProperty, value: string) => {
    updateNodeData(selectedNode.id, {
      intentProperties: {
        ...archData.intentProperties,
        [prop]: value as any,
      },
    });
  };

  return (
    <div className="w-80 bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] p-6 overflow-y-auto transition-colors duration-300">
      <div className="flex flex-col gap-1 mb-6">
        <span className="text-[10px] uppercase tracking-widest text-tech-accent font-black">Node Configuration</span>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{archData.label}</h2>
        <span className="text-xs text-[var(--color-text-secondary)]">{archData.category}</span>
      </div>

      <div className="space-y-6">
        {(Object.entries(archData.intentProperties) as [IntentProperty, string][]).map(([prop, value]) => (
          <div key={prop} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center justify-between">
              {prop.replace('-', ' ').toUpperCase()}
              <span className="text-[9px] px-1 bg-[var(--color-bg-primary)] rounded text-[var(--color-text-secondary)]">INTENT</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              {getOptionsForProp(prop).map((opt) => (
                <button
                  key={opt}
                  onClick={() => onPropertyChange(prop, opt)}
                  className={`py-2 text-[10px] font-bold rounded border transition-all ${
                    value === opt
                      ? 'bg-tech-accent border-tech-accent text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                      : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-tech-accent'
                  }`}
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
        <h4 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-2">Technical Metadata</h4>
        <div className="bg-[var(--color-bg-primary)] p-3 rounded text-[10px] font-mono text-[var(--color-text-secondary)] space-y-1">
          <div>ID: {selectedNode.id}</div>
          <div>TYPE: {selectedNode.type}</div>
          <div>POS: X={Math.round(selectedNode.position.x)}, Y={Math.round(selectedNode.position.y)}</div>
        </div>
      </div>
    </div>
  );
};

function getOptionsForProp(prop: IntentProperty): string[] {
  switch (prop) {
    case 'throughput-rate': return ['low', 'medium', 'high'];
    case 'environment': return ['edge', 'cloud'];
    case 'latency-tolerance': return ['low', 'medium', 'high'];
    case 'network-reliability': return ['stable', 'unstable', 'volatile'];
    default: return [];
  }
}
