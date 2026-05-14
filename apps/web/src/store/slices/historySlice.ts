import type { Node, Edge } from "@xyflow/react";
import type { ArchNodeData } from "@archcanvas/shared";
import type { StateCreator } from "zustand";
import type { CanvasState } from "../useCanvasStore";

const MAX_HISTORY = 50;

interface HistoryEntry {
  nodes: Node<ArchNodeData>[];
  edges: Edge[];
}

export interface HistorySlice {
  past: HistoryEntry[];
  future: HistoryEntry[];
  clipboard: Node<ArchNodeData>[];

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  copyNodes: (nodes: Node<ArchNodeData>[]) => void;
  pasteNodes: () => void;
}

export const createHistorySlice: StateCreator<CanvasState, [], [], HistorySlice> = (set, get) => ({
  past: [],
  future: [],
  clipboard: [],

  pushHistory: () => {
    const { nodes, edges, past } = get();
    const snapshot: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    set({
      past: [...past.slice(-MAX_HISTORY + 1), snapshot],
      future: [], // clear redo stack on new action
    });
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;

    const prev = past[past.length - 1];
    const current: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    set({
      past: past.slice(0, -1),
      future: [current, ...future.slice(0, MAX_HISTORY - 1)],
      nodes: prev.nodes,
      edges: prev.edges,
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;

    const next = future[0];
    const current: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    set({
      past: [...past.slice(-MAX_HISTORY + 1), current],
      future: future.slice(1),
      nodes: next.nodes,
      edges: next.edges,
    });
  },

  copyNodes: (nodes: Node<ArchNodeData>[]) => {
    // Only copy non-group nodes
    const toCopy = nodes.filter((n) => n.type !== "archGroup");
    set({ clipboard: JSON.parse(JSON.stringify(toCopy)) });
  },

  pasteNodes: () => {
    const { clipboard } = get();
    if (clipboard.length === 0) return;

    get().pushHistory();

    const OFFSET = 40;
    const now = Date.now();
    const newNodes = clipboard.map((node, i) => ({
      ...node,
      id: `${node.id}-copy-${now}-${i}`,
      selected: true,
      // Remove parent binding so pastes land on the root canvas
      parentId: undefined,
      extent: undefined,
      position: {
        x: node.position.x + OFFSET,
        y: node.position.y + OFFSET,
      },
    }));

    // Deselect existing nodes, add the pasted ones
    const currentNodes = get().nodes.map((n) => ({ ...n, selected: false }));
    set({ nodes: [...currentNodes, ...newNodes] });
  },
});
