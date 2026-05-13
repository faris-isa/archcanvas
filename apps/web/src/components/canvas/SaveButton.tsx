import React, { useState } from "react";
import { useCanvasStore } from "../../store/useCanvasStore";
import { useReactFlow } from "@xyflow/react";
import { apiClient } from "../../api/client";
import { Shortcut } from "../common/Shortcut";

export const SaveButton: React.FC = () => {
  useCanvasStore();
  const { toObject } = useReactFlow();
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    const name = prompt("Enter pipeline name:", "New Pipeline");
    if (!name) return;

    setLoading(true);
    try {
      const canvasState = toObject();
      await apiClient.createPipeline(name, canvasState);
      alert("Pipeline saved successfully!");
    } catch (error: any) {
      console.error("Save error:", error);
      const message = error.data?.error || error.message || "Unknown error";
      alert(`Failed to save pipeline: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onSave}
      disabled={loading}
      className="group flex items-center px-4 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-tech-accent rounded text-sm font-bold transition-all duration-300 disabled:opacity-50"
    >
      {loading ? "Saving..." : "Save"}
      {!loading && (
        <Shortcut
          keys={["Ctrl", "S"]}
          className="opacity-30 group-hover:opacity-100 transition-opacity"
        />
      )}
    </button>
  );
};
