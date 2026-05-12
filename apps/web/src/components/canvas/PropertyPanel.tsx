import React from 'react';
import { useOnSelectionChange, Node } from '@xyflow/react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ArchNodeData, IntentProperty } from '@archcanvas/shared';

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
      <div className="w-80 bg-tech-gray border-l border-industrial-gray p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 border border-industrial-gray">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-300 mb-1">No Selection</h2>
        <p className="text-xs text-gray-500">Select a node on the canvas to configure its intent properties.</p>
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
    <div className="w-80 bg-tech-gray border-l border-industrial-gray p-6 overflow-y-auto">
      <div className="flex flex-col gap-1 mb-6">
        <span className="text-[10px] uppercase tracking-widest text-tech-accent font-black">Node Configuration</span>
        <h2 className="text-xl font-bold text-white">{archData.label}</h2>
        <span className="text-xs text-gray-500">{archData.category}</span>
      </div>

      <div className="space-y-6">
        {(Object.entries(archData.intentProperties) as [IntentProperty, string][]).map(([prop, value]) => (
          <div key={prop} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 flex items-center justify-between">
              {prop.replace('-', ' ').toUpperCase()}
              <span className="text-[9px] px-1 bg-gray-800 rounded text-gray-500">INTENT</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              {getOptionsForProp(prop).map((opt) => (
                <button
                  key={opt}
                  onClick={() => onPropertyChange(prop, opt)}
                  className={`py-2 text-[10px] font-bold rounded border transition-all ${
                    value === opt
                      ? 'bg-tech-accent border-tech-accent text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-industrial-gray">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Technical Metadata</h4>
        <div className="bg-tech-dark/50 p-3 rounded text-[10px] font-mono text-gray-400 space-y-1">
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
