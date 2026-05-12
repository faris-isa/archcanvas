import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { AnalyzeRequest } from '@archcanvas/shared';
import { apiClient } from '../../api/client';

export const AnalyzeButton: React.FC = () => {
  const { nodes, edges, setAnalysisResults } = useCanvasStore();
  const [loading, setLoading] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setMockMode(!!data.mockMode))
      .catch(() => setMockMode(true));
  }, []);

  const onAnalyze = async () => {
    if (edges.length === 0) return;
    
    setLoading(true);
    try {
      const request: AnalyzeRequest = {
        nodes: nodes.map(n => n.data),
        edges: edges.map(e => {
          const sourceNode = nodes.find(n => n.id === e.source);
          const targetNode = nodes.find(n => n.id === e.target);
          return {
            id: e.id,
            source: e.source,
            target: e.target,
            sourceData: sourceNode!.data,
            targetData: targetNode!.data,
          };
        }),
      };

      const data = await apiClient.analyzeArchitecture(request);
      setAnalysisResults(data.edges);
    } catch (error: any) {
      console.error('Analysis error:', error);
      const message = error.data?.error || error.message || 'Unknown error';
      alert(`Analysis failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {mockMode && (
        <div className="text-[10px] bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase tracking-widest">
          Mock Mode Active
        </div>
      )}
      <button
        onClick={onAnalyze}
        disabled={loading || edges.length === 0}
        className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
          loading || edges.length === 0
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-tech-accent text-white hover:bg-blue-600'
        }`}
      >
        {loading ? 'Analyzing...' : 'Analyze Architecture'}
      </button>
    </div>
  );
};
