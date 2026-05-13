import React, { useEffect, useState } from "react";
import type { PipelineSummary } from "@archcanvas/shared";
import { useReactFlow } from "@xyflow/react";
import { useCanvasStore } from "../../store/useCanvasStore";
import { apiClient } from "../../api/client";

const OFFSHORE_RIG_EXAMPLE = {
  nodes: [
    {
      id: "sensor-1",
      type: "intentNode",
      position: { x: 0, y: 150 },
      data: {
        label: "Factory Floor Sensor",
        category: "Edge & Sources",
        intentProperties: { "throughput-rate": "low", environment: "edge", reliability: "99.9%" },
      },
    },
    {
      id: "gateway-1",
      type: "intentNode",
      position: { x: 300, y: 150 },
      data: {
        label: "Edge Gateway",
        category: "Edge & Sources",
        intentProperties: { "processing-power": "medium", "local-storage": "100GB" },
      },
    },
    {
      id: "sat-link",
      type: "intentNode",
      position: { x: 600, y: 150 },
      data: {
        label: "Satellite Link",
        category: "Intent-Based Blueprints",
        intentProperties: {
          bandwidth: "1Mbps",
          latency: "high (satellite)",
          reliability: "best-effort",
        },
      },
    },
    {
      id: "buffer-1",
      type: "intentNode",
      position: { x: 900, y: 150 },
      data: {
        label: "Cloud Pub/Sub",
        category: "Transport & Stream",
        intentProperties: { "throughput-rate": "high", "retention-period": "days" },
      },
    },
    {
      id: "processor-1",
      type: "intentNode",
      position: { x: 1200, y: 50 },
      data: {
        label: "Stream Processor",
        category: "Transport & Stream",
        intentProperties: { parallelism: "medium", "processing-mode": "stream" },
      },
    },
    {
      id: "storage-1",
      type: "intentNode",
      position: { x: 1500, y: 50 },
      data: {
        label: "InfluxDB",
        category: "Storage & DB",
        intentProperties: { "storage-tier": "hot", retention: "30 days" },
      },
    },
    {
      id: "alert-1",
      type: "intentNode",
      position: { x: 1500, y: 250 },
      data: {
        label: "Slack Webhook",
        category: "Sinks & Alerts",
        intentProperties: { priority: "high" },
      },
    },
  ],
  edges: [
    { id: "e1", source: "sensor-1", target: "gateway-1", type: "protocolEdge" },
    {
      id: "e2",
      source: "gateway-1",
      target: "sat-link",
      type: "protocolEdge",
      style: { strokeDasharray: "5,5", strokeWidth: 2 },
    },
    {
      id: "e3",
      source: "sat-link",
      target: "buffer-1",
      type: "protocolEdge",
      style: { strokeDasharray: "5,5", strokeWidth: 2 },
    },
    { id: "e4", source: "buffer-1", target: "processor-1", type: "protocolEdge" },
    { id: "e5", source: "processor-1", target: "storage-1", type: "protocolEdge" },
    { id: "e6", source: "processor-1", target: "alert-1", type: "protocolEdge" },
  ],
};

export const PipelineList: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineSummary[]>([]);
  const rf = useReactFlow();
  const [loading, setLoading] = useState(false);

  const fetchPipelines = async () => {
    try {
      const data = await apiClient.listPipelines();
      setPipelines(data);
    } catch (e) {
      console.error("Failed to fetch pipelines", e);
    }
  };

  useEffect(() => {
    fetchPipelines();
    const interval = setInterval(fetchPipelines, 10000); // Faster refresh for dev
    return () => clearInterval(interval);
  }, []);

  const onLoadData = (data: any) => {
    rf.setNodes(data.nodes || []);
    rf.setEdges(data.edges || []);
    useCanvasStore.setState({
      nodes: data.nodes || [],
      edges: data.edges || [],
    });
    setTimeout(() => {
      rf.fitView({ padding: 0.2, duration: 800 });
    }, 100);
  };

  const onLoad = async (id: string) => {
    setLoading(true);
    try {
      const data = await apiClient.getPipeline(id);
      if (data.canvasState) onLoadData(data.canvasState);
    } catch (e) {
      console.error("Failed to load pipeline", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-8 border-t border-industrial-gray pt-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-black mb-1">
          Saved Pipelines
        </h3>

        {/* Example Presets Section */}
        <div className="bg-tech-accent/5 border border-tech-accent/20 rounded p-3 mb-2">
          <div className="text-[10px] text-tech-accent font-bold uppercase mb-2 tracking-widest">
            Blueprint Presets
          </div>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                // 1. Load onto canvas immediately
                onLoadData(OFFSHORE_RIG_EXAMPLE);

                // 2. Save it to the backend in the background
                await apiClient.createPipeline("Example: Offshore Rig", OFFSHORE_RIG_EXAMPLE);
                await fetchPipelines();
              } catch (e) {
                console.error("Failed to sync example to backend", e);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-1.5 bg-tech-accent border border-blue-400 rounded text-[10px] font-bold text-white uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            {loading ? "Loading..." : "Load Offshore Rig Pipeline"}
          </button>
        </div>

        {pipelines.length === 0 && (
          <div className="text-[10px] text-gray-600 italic px-1">No saved pipelines</div>
        )}
      </div>
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
