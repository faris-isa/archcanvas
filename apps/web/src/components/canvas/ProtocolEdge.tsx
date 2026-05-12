
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

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
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: isStale ? '#f59e0b' : (protocol ? '#3b82f6' : '#4a4a4a') }} />
      <EdgeLabelRenderer>
        {protocol && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className={`px-2 py-0.5 rounded shadow-lg font-bold border group relative flex items-center gap-1 ${
              isStale 
                ? 'bg-amber-600 border-amber-400 text-white' 
                : 'bg-tech-accent border-blue-400 text-white'
            }`}>
              {isStale && (
                <span title="Stale: intent properties changed since last analysis">⚠️</span>
              )}
              {protocol}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-tech-gray border border-industrial-gray rounded text-[10px] font-normal z-50">
                {isStale ? "This recommendation might be stale. Re-analyze to update." : explanation}
              </div>
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
