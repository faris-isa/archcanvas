import { expect, test, describe, beforeEach } from "vitest";
import { useCanvasStore } from "../src/store/useCanvasStore";
import { type Node } from "@xyflow/react";
import { ArchNodeData } from "@archcanvas/shared";

describe("useCanvasStore", () => {
  beforeEach(() => {
    useCanvasStore.setState({ nodes: [], edges: [] });
  });

  test("addNode should add a node to the state", () => {
    const node: Node<ArchNodeData> = {
      id: "1",
      position: { x: 0, y: 0 },
      data: {
        label: "Test Node",
        category: "Test",
        intentProperties: {
          "throughput-rate": "medium",
          environment: "cloud",
          "latency-tolerance": "medium",
          "network-reliability": "stable",
        },
      },
    };
    useCanvasStore.getState().addNode(node);
    expect(useCanvasStore.getState().nodes).toHaveLength(1);
    expect(useCanvasStore.getState().nodes[0].id).toBe("1");
  });

  test("updateNodeData should update node data and create a new reference", () => {
    const node: Node<ArchNodeData> = {
      id: "1",
      position: { x: 0, y: 0 },
      data: {
        label: "Test Node",
        category: "Test",
        intentProperties: {
          "throughput-rate": "medium",
          environment: "cloud",
          "latency-tolerance": "medium",
          "network-reliability": "stable",
        },
      },
    };
    useCanvasStore.getState().addNode(node);
    const originalNode = useCanvasStore.getState().nodes[0];

    useCanvasStore.getState().updateNodeData("1", { label: "Updated Label" });

    const updatedNode = useCanvasStore.getState().nodes[0];
    expect(updatedNode.data.label).toBe("Updated Label");
    expect(updatedNode).not.toBe(originalNode); // Reference check
  });
});
