import React, { useState } from "react";
import { useCanvasStore } from "../../store/useCanvasStore";
import { Shortcut } from "../common/Shortcut";
import type { AnalyzeRequest } from "@archcanvas/shared";
import { apiClient } from "../../api/client";
import { RateLimitError } from "../../api/errors";
import { RateLimitToast } from "../common/RateLimitToast";
import { ErrorToast } from "../common/ErrorToast";

export const AnalyzeButton: React.FC = () => {
  const { nodes, edges, setAnalysisResults, selectedModel } = useCanvasStore();
  const [loading, setLoading] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<{ retryAfter?: string } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  React.useEffect(() => {
    apiClient
      .getHealth()
      .then((data) => setMockMode(!!data.mockMode))
      .catch(() => setMockMode(false)); // network failure ≠ mock mode; don't show false positive
  }, []);

  const onAnalyze = async () => {
    if (edges.length === 0) return;

    setLoading(true);
    try {
      const request: AnalyzeRequest = {
        // Exclude group container nodes — they're layout artifacts, not real architecture nodes
        nodes: nodes.filter((n) => n.type !== "archGroup").map((n) => ({ id: n.id, ...n.data })),
        edges: edges
          .filter((e) => {
            const src = nodes.find((n) => n.id === e.source && n.type !== "archGroup");
            const tgt = nodes.find((n) => n.id === e.target && n.type !== "archGroup");
            return src && tgt;
          })
          .map((e) => {
            const sourceNode = nodes.find((n) => n.id === e.source);
            const targetNode = nodes.find((n) => n.id === e.target);
            return {
              id: e.id,
              source: e.source,
              target: e.target,
              sourceData: sourceNode!.data,
              targetData: targetNode!.data,
            };
          }),
        model: selectedModel,
      };

      const data = await apiClient.analyzeArchitecture(request);
      setAnalysisResults(data.edges, data.suggestions, data.grouping);
    } catch (error: any) {
      console.error("Analysis error:", error);
      if (error instanceof RateLimitError) {
        setRateLimitError({ retryAfter: error.retryAfter });
      } else {
        const message = error.data?.error || error.message || "Unknown error";
        setGeneralError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (!loading && edges.length > 0) {
          event.preventDefault();
          onAnalyze();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, edges, nodes]);

  return (
    <div className="flex flex-col items-end gap-2">
      {mockMode && (
        <div className="text-[10px] bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase tracking-widest animate-pulse">
          Mock Mode Active
        </div>
      )}
      <button
        onClick={onAnalyze}
        disabled={loading || edges.length === 0}
        title="Shortcut: Ctrl + Enter"
        className={`group relative px-4 py-1.5 rounded text-sm font-bold transition-all duration-300 ${
          loading || edges.length === 0
            ? "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] opacity-50 cursor-not-allowed border border-[var(--color-border)]"
            : "bg-tech-accent text-white hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        }`}
      >
        <div className="flex items-center gap-2">
          {loading ? "Analyzing..." : "Analyze Architecture"}
          {!loading && (
            <Shortcut
              keys={["Ctrl", "Enter"]}
              className="opacity-50 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>
        {!loading && edges.length > 0 && (
          <div className="absolute inset-0 rounded bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        )}
      </button>
      {rateLimitError && (
        <RateLimitToast
          retryAfter={rateLimitError.retryAfter}
          onDismiss={() => setRateLimitError(null)}
        />
      )}
      {generalError && (
        <ErrorToast
          title="Analysis failed"
          message={generalError}
          onDismiss={() => setGeneralError(null)}
        />
      )}
    </div>
  );
};
