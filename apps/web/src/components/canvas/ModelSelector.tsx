import React from "react";
import { Brain } from "lucide-react";

import { useCanvasStore } from "../../store/useCanvasStore";
import { apiClient } from "../../api/client";

export const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useCanvasStore();
  const [availableModels, setAvailableModels] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await apiClient.getGeminiModels();
        if (response.status === "success") {
          // Filter for models that support generateContent and remove 'models/' prefix
          const models = response.models
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => ({
              id: m.name.replace("models/", ""),
              displayName: m.displayName,
            }))
            .sort((a: any, b: any) => b.id.localeCompare(a.id));

          setAvailableModels(models);
        }
      } catch (err) {
        console.error("Failed to fetch Gemini models:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="flex items-center bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-md px-2 py-1 gap-2 transition-all hover:border-tech-accent/50 group">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-r border-[var(--color-border)] pr-2">
        <Brain className="w-3 h-3 text-tech-accent" />
        AI Model
      </div>
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-[var(--color-text-primary)] pr-1"
        disabled={loading}
      >
        {loading ? (
          <option>Loading...</option>
        ) : (
          <>
            {/* Always include the latest aliases at the top */}
            <option value="gemini-flash-latest">Gemini Flash (Auto)</option>
            <option value="gemini-pro-latest">Gemini Pro (Auto)</option>
            <hr />
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.displayName}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};
