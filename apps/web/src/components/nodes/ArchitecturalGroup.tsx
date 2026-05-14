import React, { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "../../store/useCanvasStore";

const ArchitecturalGroup: React.FC<NodeProps> = ({ id, data, selected }) => {
  const label = data.label as string;
  const isFolded = data.isFolded as boolean;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  const lowerLabel = label.toLowerCase();
  const isBronze = lowerLabel.includes("bronze");
  const isSilver = lowerLabel.includes("silver");
  const isGold = lowerLabel.includes("gold") || lowerLabel.includes("storage");
  const isEdge = lowerLabel.includes("edge") || lowerLabel.includes("acquisition");
  const isTransport = lowerLabel.includes("transport");
  const isMedallion = lowerLabel.includes("medallion") || lowerLabel.includes("transformation");
  const isObservability = lowerLabel.includes("observ") || lowerLabel.includes("quality");

  let borderColor = "border-gray-500";
  let bgColor = "bg-gray-500/5";
  let textColor = "text-gray-400";
  let dotColor = "bg-gray-400";

  if (isBronze) {
    borderColor = "border-[#cd7f32]";
    bgColor = "bg-[#cd7f32]/5";
    textColor = "text-[#cd7f32]";
    dotColor = "bg-[#cd7f32]";
  } else if (isSilver || isMedallion) {
    borderColor = "border-[#c0c0c0]";
    bgColor = "bg-[#c0c0c0]/5";
    textColor = "text-[#c0c0c0]";
    dotColor = "bg-[#c0c0c0]";
  } else if (isGold) {
    borderColor = "border-[#ffd700]";
    bgColor = "bg-[#ffd700]/5";
    textColor = "text-[#ffd700]";
    dotColor = "bg-[#ffd700]";
  } else if (isEdge) {
    borderColor = "border-emerald-500";
    bgColor = "bg-emerald-500/5";
    textColor = "text-emerald-500";
    dotColor = "bg-emerald-500";
  } else if (isTransport) {
    borderColor = "border-sky-400";
    bgColor = "bg-sky-400/5";
    textColor = "text-sky-400";
    dotColor = "bg-sky-400";
  } else if (isObservability) {
    borderColor = "border-violet-400";
    bgColor = "bg-violet-400/5";
    textColor = "text-violet-400";
    dotColor = "bg-violet-400";
  }

  const childCount = useCanvasStore((s) => s.nodes.filter((n) => n.parentId === id).length);

  return (
    <div
      className={`h-full w-full rounded-xl border-2 border-dashed ${borderColor} ${bgColor} transition-all duration-500 relative group ${isFolded ? "opacity-60" : ""}`}
    >
      {!isFolded && (
        <NodeResizer color="#3b82f6" isVisible={selected} minWidth={200} minHeight={100} />
      )}

      <div className="absolute -top-3 left-6 px-3 py-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full flex items-center gap-3 shadow-lg z-10">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${textColor}`}>
          {label} {isFolded && `(${childCount} Nodes)`}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateNodeData(id, { isFolded: !isFolded });
          }}
          className="ml-2 text-[10px] hover:text-white transition-colors p-0.5"
          title={isFolded ? "Expand Group" : "Collapse Group"}
        >
          {isFolded ? "Expand" : "Fold"}
        </button>
      </div>

      {!isFolded && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none overflow-hidden">
          <span
            className={`text-4xl font-black uppercase tracking-[0.5em] ${textColor} whitespace-nowrap`}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(ArchitecturalGroup);
