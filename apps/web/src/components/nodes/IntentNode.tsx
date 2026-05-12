import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { ArchNodeData, IntentProperty } from '@archcanvas/shared';
import { useCanvasStore } from '../../store/useCanvasStore';

const IntentNode: React.FC<NodeProps> = ({ id, data }) => {
  const archData = data as ArchNodeData;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  const onPropertyChange = (prop: IntentProperty, value: string) => {
    updateNodeData(id, {
      intentProperties: {
        ...archData.intentProperties,
        [prop]: value,
      },
    });
  };

  const isStale = useCanvasStore((s) => s.edges.some(e => (e.source === id || e.target === id) && e.data?.isStale));

  return (
    <div className={`bg-[var(--color-bg-secondary)] border-2 rounded-md shadow-xl min-w-[220px] overflow-hidden transition-all ${
      isStale ? 'border-amber-500/50' : 'border-[var(--color-border)] hover:border-tech-accent'
    }`}>
      <div className="bg-[var(--color-bg-primary)] px-3 py-2 border-b border-[var(--color-border)] flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-tech-accent font-bold leading-none mb-1">
            {archData.category}
          </span>
          <span className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            {archData.label}
            {isStale && (
              <span className="text-amber-500 text-[10px]" title="Properties changed. Re-analysis recommended.">
                ⚠️
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3 bg-[var(--color-bg-secondary)]/50">
        {(Object.entries(archData.intentProperties) as [IntentProperty, string][]).map(([prop, value]) => (
          <div key={prop} className="flex flex-col gap-1">
            <label className="text-[9px] uppercase text-[var(--color-text-secondary)] font-bold">{prop.replace('-', ' ')}</label>
            <select
              className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded text-[11px] px-2 py-1 text-[var(--color-text-primary)] outline-none focus:border-tech-accent transition-colors"
              value={value}
              onChange={(e) => onPropertyChange(prop, e.target.value)}
            >
              {getOptionsForProp(prop).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-tech-accent !border-2 !border-[var(--color-bg-primary)]" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-tech-accent !border-2 !border-[var(--color-bg-primary)]" />
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

export default memo(IntentNode);
