import React, { useState, useEffect } from "react";
import { useCanvasStore } from "../../store/useCanvasStore";
import { apiClient } from "../../api/client";
import { ErrorToast } from "../common/ErrorToast";
import type { AnalyzeRequest } from "@archcanvas/shared";
import { Download } from "lucide-react";
import { Shortcut } from "../common/Shortcut";

export const ExportButton: React.FC = () => {
  const { nodes, edges, selectedModel } = useCanvasStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onExport = async () => {
    if (nodes.length === 0) return;

    // Open tab synchronously to prevent popup blocker
    const newTab = window.open("", "_blank");
    if (!newTab) {
      setError("Popup blocked. Please allow popups for this site.");
      return;
    }

    newTab.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Generating Report...</title>
        <style>
          body { background: #1a1a2e; color: #a855f7; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .loader { border: 4px solid #ffffff33; border-top: 4px solid #a855f7; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 1rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .container { display: flex; flex-direction: column; align-items: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loader"></div>
          <h2>Analyzing Architecture...</h2>
          <p>Please wait while Gemini generates your report.</p>
        </div>
      </body>
      </html>
    `);
    newTab.document.close();

    setLoading(true);
    try {
      const request: AnalyzeRequest = {
        nodes: nodes.filter((n) => n.type !== "archGroup").map((n) => ({ id: n.id, ...n.data })),
        edges: edges.map((e) => {
          const sourceNode = nodes.find((n) => n.id === e.source);
          const targetNode = nodes.find((n) => n.id === e.target);
          return {
            id: e.id,
            source: e.source,
            target: e.target,
            sourceData: sourceNode?.data || {},
            targetData: targetNode?.data || {},
          };
        }),
        model: selectedModel,
      };

      const htmlContent = await apiClient.exportArchitecture(request);

      // Overwrite the loading screen with the actual report
      newTab.document.open();
      newTab.document.write(htmlContent);
      newTab.document.close();
    } catch (err: any) {
      console.error("Export error:", err);
      setError(err.message || "Failed to generate report");
      newTab.close(); // Close the loading tab on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept shortcuts when the user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (!isTyping && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        if (!loading && nodes.length > 0) {
          onExport();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, nodes, edges]);

  return (
    <>
      <button
        onClick={onExport}
        disabled={loading || nodes.length === 0}
        title="Shortcut: Ctrl + E"
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded text-sm font-bold transition-all duration-300 ${
          loading || nodes.length === 0
            ? "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] opacity-50 cursor-not-allowed border border-[var(--color-border)]"
            : "bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        }`}
      >
        <Download size={16} />
        {loading ? "Exporting..." : "Export"}
        {!loading && (
          <Shortcut
            keys={["Ctrl", "E"]}
            className="opacity-50 group-hover:opacity-100 transition-opacity"
          />
        )}
        {!loading && nodes.length > 0 && (
          <div className="absolute inset-0 rounded bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        )}
      </button>

      {error && (
        <ErrorToast title="Export failed" message={error} onDismiss={() => setError(null)} />
      )}
    </>
  );
};
