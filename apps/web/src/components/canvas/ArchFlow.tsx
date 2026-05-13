import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { IntentValues } from '@archcanvas/shared';
import IntentNode from '../nodes/IntentNode';
import ProtocolEdge from './ProtocolEdge';

import { useTheme } from '../../hooks/useTheme';
import { getDefaultProperties } from '../../config/nodeSchemas';

const nodeTypes = {
  intentNode: IntentNode,
};

const edgeTypes = {
  protocolEdge: ProtocolEdge,
};

export const ArchFlow: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useCanvasStore();
  const { theme } = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const category = event.dataTransfer.getData('application/category');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'intentNode',
        position,
        data: { 
          label: type, 
          category, 
          intentProperties: getDefaultProperties(type)
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'protocolEdge' }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Control"
        selectionKeyCode="Shift"
        fitView
      >
        <Controls />
        <Background color={theme === 'dark' ? '#555' : '#aaa'} gap={16} />
      </ReactFlow>
    </div>
  );
};
