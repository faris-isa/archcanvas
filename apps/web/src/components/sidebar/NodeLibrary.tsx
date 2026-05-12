import React from 'react';
import { PipelineList } from './PipelineList';

const NODE_TYPES = [
  { category: 'Edge Devices', types: ['Factory Floor Sensor', 'Edge Gateway', 'PLC Controller'] },
  { category: 'Transport Layers', types: ['Message Broker', 'Stream Processor'] },
  { category: 'Storage/Sinks', types: ['Time-Series DB', 'Data Lake', 'High-Speed Sink'] },
];

export const NodeLibrary: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, category: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/category', category);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] p-4 flex flex-col gap-6 overflow-y-auto transition-colors duration-300">
      <h2 className="text-xl font-bold text-industrial-gold mb-2">Node Library</h2>
      {NODE_TYPES.map((cat) => (
        <div key={cat.category} className="flex flex-col gap-2">
          <h3 className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-bold">{cat.category}</h3>
          {cat.types.map((type) => (
            <div
              key={type}
              className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-3 rounded cursor-grab hover:border-tech-accent transition-colors"
              onDragStart={(event) => onDragStart(event, type, cat.category)}
              draggable
            >
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{type}</span>
            </div>
          ))}
        </div>
      ))}
      <PipelineList />
    </div>
  );
};
