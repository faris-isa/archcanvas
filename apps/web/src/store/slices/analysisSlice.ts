import type { Node } from "@xyflow/react";
import type { ArchNodeData } from "@archcanvas/shared";
import type { StateCreator } from "zustand";
import type { CanvasState } from "../useCanvasStore";

export interface AnalysisSlice {
  suggestions: {
    title: string;
    description: string;
    suggestedNodeType?: string;
    priority: "low" | "medium" | "high";
  }[];
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
}

export const createAnalysisSlice: StateCreator<CanvasState, [], [], AnalysisSlice> = (
  set,
  get,
) => ({
  suggestions: [],

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

    let updatedNodes = currentNodes;
    if (grouping && grouping.length > 0) {
      const uniqueGroups = Array.from(new Set(grouping.map((g) => g.groupLabel)));
      const groupNodes: Node<ArchNodeData>[] = [];

      uniqueGroups.forEach((groupLabel, idx) => {
        const groupId = `group-${groupLabel.replace(/\s+/g, "-").toLowerCase()}`;
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
});
