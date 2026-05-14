import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { ArchNodeData } from "@archcanvas/shared";
import { getDefaultProperties } from "../../config/nodeSchemas";
import type { StateCreator } from "zustand";
import type { CanvasState } from "../useCanvasStore";

export interface CanvasSlice {
  nodes: Node<ArchNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<ArchNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<ArchNodeData>) => void;
  setCanvasState: (nodes: Node<ArchNodeData>[], edges: Edge[]) => void;
  addNodeByType: (type: string) => void;
  updateNodeData: (nodeId: string, data: Partial<ArchNodeData>) => void;
}

export const createCanvasSlice: StateCreator<CanvasState, [], [], CanvasSlice> = (set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes: NodeChange<Node<ArchNodeData>>[]) => {
    // Snapshot before deletions
    if (changes.some((c) => c.type === "remove")) get().pushHistory();
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    if (changes.some((c) => c.type === "remove")) get().pushHistory();
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    get().pushHistory();
    const nodes = get().nodes;
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

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
    get().pushHistory();
    set({
      nodes: [...get().nodes, node],
    });
  },

  setCanvasState: (nodes, edges) => {
    get().pushHistory();

    const GROUP_KEYWORDS = [
      "layer",
      "engine",
      "hub",
      "zone",
      "sink",
      "transport",
      "acquisition",
      "medallion",
      "transformation",
      "observ",
      "bronze",
      "silver",
      "gold",
      "storage",
    ];

    const sanitizedNodes =
      nodes?.map((node) => {
        const labelStr = typeof node.data?.label === "string" ? node.data.label : "";
        const labelLower = labelStr.toLowerCase();

        // Treat as group if label matches known architectural layer keywords
        const isGroup =
          node.type === "archGroup" || GROUP_KEYWORDS.some((kw) => labelLower.includes(kw));

        const type = isGroup ? "archGroup" : "intentNode";
        const intentProperties = isGroup
          ? {}
          : {
              ...getDefaultProperties(labelStr),
              ...node.data?.intentProperties,
            };

        return {
          ...node,
          type,
          data: {
            ...node.data,
            intentProperties,
          },
        };
      }) || [];

    // Put archGroup nodes first so React Flow can resolve parent references
    const sorted = [
      ...sanitizedNodes.filter((n) => n.type === "archGroup"),
      ...sanitizedNodes.filter((n) => n.type !== "archGroup"),
    ];

    set({
      nodes: sorted,
      edges: edges || [],
    });
  },

  addNodeByType: (type: string) => {
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
});
