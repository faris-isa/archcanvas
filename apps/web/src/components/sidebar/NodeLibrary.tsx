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
    <div className="w-64 bg-tech-gray border-r border-industrial-gray p-4 flex flex-col gap-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-industrial-gold mb-2">Node Library</h2>
      {NODE_TYPES.map((cat) => (
        <div key={cat.category} className="flex flex-col gap-2">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold">{cat.category}</h3>
          {cat.types.map((type) => (
            <div
              key={type}
              className="bg-gray-800 border border-gray-700 p-3 rounded cursor-grab hover:border-tech-accent transition-colors"
              onDragStart={(event) => onDragStart(event, type, cat.category)}
              draggable
            >
              <span className="text-sm font-medium">{type}</span>
            </div>
          ))}
        </div>
      ))}
      <PipelineList />
    </div>
  );
};
