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

// Calculate the rendered height of an IntentNode from its property count
function estimateNodeHeight(node: Node<ArchNodeData>): number {
  const NODE_HEADER = 62; // category + icon + label row
  const PROP_HEIGHT = 62; // label + dropdown per property
  const NODE_PADDING = 20; // top+bottom inner padding
  const propCount = Object.keys(node.data?.intentProperties || {}).length;
  return NODE_HEADER + propCount * PROP_HEIGHT + NODE_PADDING;
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

      // Always start fresh: remove stale group containers and clear child parentIds
      // This prevents circular parentId references on re-analysis
      updatedNodes = updatedNodes
        .filter((n) => n.type !== "archGroup")
        .map((n) => ({ ...n, parentId: undefined, extent: undefined }));

      // Build per-group child lists (preserving order)
      const childrenPerGroup: Record<string, string[]> = {};
      uniqueGroups.forEach((g) => {
        childrenPerGroup[g] = [];
      });
      grouping.forEach(({ nodeId, groupLabel }) => {
        if (childrenPerGroup[groupLabel]) childrenPerGroup[groupLabel].push(nodeId);
      });

      const NODE_W = 240;
      const NODE_GAP = 14;
      const PADDING_X = 20;
      const PADDING_TOP = 44; // space from top of group to first child (below label pill)
      const PADDING_BOT = 20;
      const GROUP_GAP = 24; // horizontal gap between groups

      const groupNodes: Node<ArchNodeData>[] = [];
      // Track absolute Y positions per group-child for accurate group sizing
      const childPositions: Record<string, { x: number; y: number }[]> = {};
      let xOffset = 30;

      uniqueGroups.forEach((groupLabel) => {
        const groupId = `group-${groupLabel.replace(/\s+/g, "-").toLowerCase()}`;

        const childIds = childrenPerGroup[groupLabel];
        childPositions[groupId] = [];

        // Compute each child's Y based on actual property counts
        let yOffset = PADDING_TOP;
        childIds.forEach((childId) => {
          const childNode = currentNodes.find((n) => n.id === childId);
          childPositions[groupId].push({ x: PADDING_X, y: yOffset });
          const h = childNode ? estimateNodeHeight(childNode) : 200;
          yOffset += h + NODE_GAP;
        });

        const groupHeight = yOffset - NODE_GAP + PADDING_BOT;
        const groupWidth = NODE_W + PADDING_X * 2;

        groupNodes.push({
          id: groupId,
          type: "archGroup",
          position: { x: xOffset, y: 30 },
          data: {
            label: groupLabel,
            category: "Architectural Layer",
            intentProperties: {},
          },
          style: { width: groupWidth, height: groupHeight },
        });

        xOffset += groupWidth + GROUP_GAP;
      });

      // Track per-group child index for position lookup
      const childIndexTracker: Record<string, number> = {};

      updatedNodes = [...updatedNodes, ...groupNodes].map((node) => {
        const groupAssignment = grouping.find((g) => g.nodeId === node.id);
        if (groupAssignment) {
          const groupId = `group-${groupAssignment.groupLabel.replace(/\s+/g, "-").toLowerCase()}`;
          const childIdx = childIndexTracker[groupId] ?? 0;
          childIndexTracker[groupId] = childIdx + 1;
          const pos = childPositions[groupId]?.[childIdx] ?? { x: PADDING_X, y: PADDING_TOP };

          return {
            ...node,
            parentId: groupId,
            extent: "parent" as const,
            position: pos,
          };
        }
        return node;
      });

      // React Flow requires parent nodes to appear BEFORE their children
      updatedNodes = [
        ...updatedNodes.filter((n) => n.type === "archGroup"),
        ...updatedNodes.filter((n) => n.type !== "archGroup"),
      ];
    }

    set({
      suggestions: suggestions || [],
      edges: currentEdges,
      nodes: updatedNodes,
    });
  },
});
