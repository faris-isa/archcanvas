import { create } from "zustand";
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
  type Connection,
} from "@xyflow/react";
import type { ArchNodeData } from "@archcanvas/shared";
import { getDefaultProperties } from "../config/nodeSchemas";

interface CanvasState {
  nodes: Node<ArchNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<ArchNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<ArchNodeData>) => void;
  addNodeByType: (type: string) => void;
  updateNodeData: (nodeId: string, data: Partial<ArchNodeData>) => void;
  setAnalysisResults: (
    edges: { edgeId: string; recommendedProtocol: string; engineeringExplanation: string }[],
    suggestions?: {
      title: string;
      description: string;
      suggestedNodeType?: string;
      priority: "low" | "medium" | "high";
    }[],
  ) => void;
  suggestions: {
    title: string;
    description: string;
    suggestedNodeType?: string;
    priority: "low" | "medium" | "high";
  }[];
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  rightSidebarTab: "chat" | "insights" | "properties";
  setRightSidebarTab: (tab: "chat" | "insights" | "properties") => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  suggestions: [],
  leftSidebarOpen: true,
  rightSidebarOpen: false,
  rightSidebarTab: "chat",
  selectedModel: "gemini-flash-latest",

  toggleLeftSidebar: () => set({ leftSidebarOpen: !get().leftSidebarOpen }),
  toggleRightSidebar: () => set({ rightSidebarOpen: !get().rightSidebarOpen }),
  setRightSidebarOpen: (open: boolean) => set({ rightSidebarOpen: open }),
  setRightSidebarTab: (tab: "chat" | "insights" | "properties") => set({ rightSidebarTab: tab }),
  setSelectedModel: (model: string) => set({ selectedModel: model }),

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

  addNodeByType: (type: string) => {
    const newNode: Node<ArchNodeData> = {
      id: `${type}-${Date.now()}`,
      type: "intentNode",
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        label: type,
        category: "Suggested",
        intentProperties: getDefaultProperties(type),
      },
    };
    set({
      nodes: [...get().nodes, newNode],
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
