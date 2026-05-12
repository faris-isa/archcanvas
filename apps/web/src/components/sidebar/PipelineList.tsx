import React, { useEffect, useState } from 'react';
import { PipelineSummary } from '@archcanvas/shared';
import { useReactFlow } from '@xyflow/react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { apiClient } from '../../api/client';

export const PipelineList: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineSummary[]>([]);
  const { setNodes, setEdges, setViewport } = useReactFlow();
  const [loading, setLoading] = useState(false);

  const fetchPipelines = async () => {
    try {
      const data = await apiClient.listPipelines();
      setPipelines(data);
    } catch (e) {
      console.error('Failed to fetch pipelines', e);
    }
  };

  useEffect(() => {
    fetchPipelines();
    // Refresh every 30s
    const interval = setInterval(fetchPipelines, 30000);
    return () => clearInterval(interval);
  }, []);

  const onLoad = async (id: string) => {
    setLoading(true);
    try {
      const data = await apiClient.getPipeline(id);
      const flow = JSON.parse(data.canvasState);
      
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
        
        // Also update store to be in sync
        useCanvasStore.setState({ 
          nodes: flow.nodes || [], 
          edges: flow.edges || [] 
        });
      }
    } catch (e) {
      console.error('Failed to load pipeline', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-8 border-t border-industrial-gray pt-6">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Saved Pipelines</h3>
      {pipelines.length === 0 && <div className="text-[10px] text-gray-600 italic">No saved pipelines</div>}
      <div className="flex flex-col gap-1">
        {pipelines.map((p) => (
          <div key={p.id} className="group relative">
            <button
              onClick={() => onLoad(p.id)}
              disabled={loading}
              className="w-full text-left px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded text-xs border border-transparent hover:border-tech-accent transition-all truncate pr-8"
            >
              {p.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete pipeline "${p.name}"?`)) {
                  apiClient.deletePipeline(p.id).then(fetchPipelines);
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete pipeline"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
