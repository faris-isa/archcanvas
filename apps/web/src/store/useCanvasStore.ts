import { create } from 'zustand'
import { 
  applyNodeChanges, 
  applyEdgeChanges, 
  type Node, 
  type Edge, 
  type OnNodesChange, 
  type OnEdgesChange, 
  type NodeChange, 
  type EdgeChange,
  addEdge,
  type Connection
} from '@xyflow/react'
import type { ArchNodeData } from '@archcanvas/shared'

interface CanvasState {
  nodes: Node<ArchNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<ArchNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<ArchNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<ArchNodeData>) => void;
  setAnalysisResults: (edges: { edgeId: string; recommendedProtocol: string; engineeringExplanation: string }[], suggestions?: { title: string; description: string; suggestedNodeType?: string; priority: 'low' | 'medium' | 'high' }[]) => void;
  suggestions: { title: string; description: string; suggestedNodeType?: string; priority: 'low' | 'medium' | 'high' }[];
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  suggestions: [],

  onNodesChange: (changes: NodeChange<Node<ArchNodeData>>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (node: Node<ArchNodeData>) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  updateNodeData: (nodeId: string, data: Partial<ArchNodeData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      }),
      edges: get().edges.map((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          return {
            ...edge,
            data: { ...edge.data, isStale: true },
          };
        }
        return edge;
      }),
    });
  },

  setAnalysisResults: (edges, suggestions) => {
    set({
      suggestions: suggestions || [],
      edges: get().edges.map((edge) => {
        const result = edges.find((r) => r.edgeId === edge.id);
        if (result) {
          return {
            ...edge,
            data: {
              ...edge.data,
              recommendedProtocol: result.recommendedProtocol,
              engineeringExplanation: result.engineeringExplanation,
              isStale: false,
            },
          };
        }
        return edge;
      }),
    });
  },
}));
