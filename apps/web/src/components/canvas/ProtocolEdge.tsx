import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";

export default function ProtocolEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const protocol = data?.recommendedProtocol as string | undefined;
  const explanation = data?.engineeringExplanation as string | undefined;
  const isStale = data?.isStale as boolean | undefined;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isStale ? "#f59e0b" : protocol ? "#3b82f6" : "#4a4a4a",
          strokeWidth: 2,
          animation: style?.strokeDasharray ? "dashdraw 0.5s linear infinite" : "none",
        }}
      />
      <EdgeLabelRenderer>
        {protocol && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: "all",
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-2 py-0.5 rounded shadow-xl font-bold border group relative flex items-center gap-1 transition-transform hover:scale-110 ${
                isStale
                  ? "bg-amber-600 border-amber-400 text-white"
                  : "bg-tech-accent border-blue-400 text-white"
              }`}
            >
              {isStale && (
                <span title="Stale: intent properties changed since last analysis">⚠️</span>
              )}
              {protocol}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-tech-gray border border-industrial-gray rounded shadow-2xl text-[10px] font-normal z-[1001] pointer-events-none backdrop-blur-md bg-opacity-95">
                <div className="text-industrial-gold font-bold mb-1 uppercase tracking-wider">
                  Analysis Recommendation
                </div>
                {isStale
                  ? "This recommendation might be stale. Re-analyze to update."
                  : explanation}
              </div>
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
