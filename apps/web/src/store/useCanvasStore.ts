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
import type { ArchNodeData, CustomNodeTemplate } from "@archcanvas/shared";
import { getDefaultProperties, NODE_SCHEMAS } from "../config/nodeSchemas";

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
    grouping?: {
      nodeId: string;
      groupLabel: string;
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
  customTemplates: CustomNodeTemplate[];
  addCustomTemplate: (template: CustomNodeTemplate) => void;
  removeCustomTemplate: (id: string) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  suggestions: [],
  leftSidebarOpen: true,
  rightSidebarOpen: false,
  rightSidebarTab: "chat",
  selectedModel: "gemini-flash-latest",
  customTemplates: [],

  toggleLeftSidebar: () => set({ leftSidebarOpen: !get().leftSidebarOpen }),
  toggleRightSidebar: () => set({ rightSidebarOpen: !get().rightSidebarOpen }),
  setRightSidebarOpen: (open: boolean) => set({ rightSidebarOpen: open }),
  setRightSidebarTab: (tab: "chat" | "insights" | "properties") => set({ rightSidebarTab: tab }),
  setSelectedModel: (model: string) => set({ selectedModel: model }),

  addCustomTemplate: (template) =>
    set((state) => ({
      customTemplates: [...state.customTemplates, template],
    })),

  removeCustomTemplate: (id) =>
    set((state) => ({
      customTemplates: state.customTemplates.filter((t) => t.id !== id),
    })),

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
    const nodes = get().nodes;
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    // Determine if this is a "Long Distance" or "Abstract" link
    const isWan =
      sourceNode?.data.label.includes("WAN") ||
      targetNode?.data.label.includes("WAN") ||
      sourceNode?.data.label.includes("Satellite") ||
      targetNode?.data.label.includes("Satellite") ||
      sourceNode?.data.label.includes("5G") ||
      targetNode?.data.label.includes("5G") ||
      sourceNode?.data.label.includes("VPN") ||
      targetNode?.data.label.includes("VPN");

    const edgeStyle = isWan ? { strokeDasharray: "5,5", strokeWidth: 2 } : { strokeWidth: 2 };

    set({
      edges: addEdge({ ...connection, style: edgeStyle }, get().edges),
    });
  },

  addNode: (node: Node<ArchNodeData>) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  addNodeByType: (type: string) => {
    // Check if it's a custom template
    const template = get().customTemplates.find((t) => t.name === type);

    const intentProperties = template
      ? template.attributes.reduce(
          (acc, attr) => {
            acc[attr.name] = attr.default;
            return acc;
          },
          {} as Record<string, string>,
        )
      : getDefaultProperties(type);

    const isGroup =
      type.includes("Layer") &&
      (type.includes("Bronze") || type.includes("Silver") || type.includes("Gold"));

    const newNode: Node<ArchNodeData> = {
      id: `${type}-${Date.now()}`,
      type: isGroup ? "archGroup" : "intentNode",
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        label: type,
        category: template
          ? template.category
          : isGroup
            ? "Medallion Layers (Data Engineering)"
            : "Suggested",
        intentProperties,
        templateId: template?.id,
      },
      ...(isGroup ? { style: { width: 400, height: 300 } } : {}),
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

  setAnalysisResults: (edges, suggestions, grouping) => {
    const currentNodes = [...get().nodes];
    const currentEdges = get().edges.map((edge) => {
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
    });

    // Handle Grouping
    let updatedNodes = currentNodes;
    if (grouping && grouping.length > 0) {
      const uniqueGroups = Array.from(new Set(grouping.map((g) => g.groupLabel)));
      const groupNodes: Node<ArchNodeData>[] = [];

      uniqueGroups.forEach((groupLabel, idx) => {
        const groupId = `group-${groupLabel.replace(/\s+/g, "-").toLowerCase()}`;
        // Only create if it doesn't exist
        if (!updatedNodes.find((n) => n.id === groupId)) {
          groupNodes.push({
            id: groupId,
            type: "archGroup",
            position: { x: 50 + idx * 450, y: 50 },
            data: {
              label: groupLabel,
              category: "Medallion Layers (Data Engineering)",
              intentProperties: {},
            },
            style: { width: 400, height: 600 },
          });
        }
      });

      updatedNodes = [...updatedNodes, ...groupNodes].map((node) => {
        const groupAssignment = grouping.find((g) => g.nodeId === node.id);
        if (groupAssignment) {
          const groupId = `group-${groupAssignment.groupLabel.replace(/\s+/g, "-").toLowerCase()}`;
          return {
            ...node,
            parentId: groupId,
            extent: "parent",
            position: {
              x: 20,
              y: 50 + updatedNodes.filter((n) => n.parentId === groupId).indexOf(node) * 150,
            },
          };
        }
        return node;
      });
    }

    set({
      suggestions: suggestions || [],
      edges: currentEdges,
      nodes: updatedNodes,
    });
  },
}));
