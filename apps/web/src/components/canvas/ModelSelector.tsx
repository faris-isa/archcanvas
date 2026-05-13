import React, { useState, useRef } from "react";
import { Brain, ChevronDown, Sparkles, Check, Loader2 } from "lucide-react";
import { useCanvasStore } from "../../store/useCanvasStore";
import { apiClient } from "../../api/client";
import { useClickOutside } from "../../hooks/useClickOutside";

export const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useCanvasStore();
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await apiClient.getGeminiModels();
        if (response.status === "success") {
          const models = response.models
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => ({
              id: m.name.replace("models/", ""),
              displayName: m.displayName,
              description: m.description,
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

  const getCurrentModelName = () => {
    if (selectedModel === "gemini-flash-latest") return "Gemini Flash (Auto)";
    if (selectedModel === "gemini-pro-latest") return "Gemini Pro (Auto)";
    const model = availableModels.find((m) => m.id === selectedModel);
    return model ? model.displayName : selectedModel;
  };

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsOpen(false);
  };

  const autoModels = [
    { id: "gemini-flash-latest", name: "Gemini Flash (Auto)", desc: "Fastest & balanced" },
    { id: "gemini-pro-latest", name: "Gemini Pro (Auto)", desc: "Most capable for complex logic" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-md px-3 py-1.5 gap-3 transition-all hover:border-tech-accent/50 group select-none ${
          isOpen ? "border-tech-accent shadow-[0_0_10px_rgba(59,130,246,0.2)]" : ""
        } ${loading ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] border-r border-[var(--color-border)] pr-3 group-hover:text-tech-accent transition-colors">
          <Brain className={`w-3.5 h-3.5 ${isOpen ? "text-tech-accent" : "text-tech-accent/70"}`} />
          AI Brain
        </div>

        <div className="flex items-center gap-2 min-w-[140px]">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] italic">
              <Loader2 className="w-3 h-3 animate-spin" />
              Initializing...
            </div>
          ) : (
            <>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {getCurrentModelName()}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[var(--color-text-secondary)] transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-[280px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/50">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tech-accent/70 px-2">
              Optimization Layer
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {/* Auto Models Section */}
            <div className="py-1">
              {autoModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-tech-accent/10 transition-colors group/item"
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-bold text-[var(--color-text-primary)] group-hover/item:text-tech-accent transition-colors">
                        {model.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-secondary)] italic">
                      {model.desc}
                    </span>
                  </div>
                  {selectedModel === model.id && <Check className="w-3.5 h-3.5 text-tech-accent" />}
                </button>
              ))}
            </div>

            <div className="h-px bg-[var(--color-border)] mx-2 my-1" />

            {/* Catalog Section */}
            <div className="py-1">
              <div className="px-4 py-1 text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tighter opacity-50">
                Model Catalog
              </div>
              {availableModels.length > 0 ? (
                availableModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model.id)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors group/item"
                  >
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-xs text-[var(--color-text-secondary)] group-hover/item:text-[var(--color-text-primary)] truncate w-full text-left">
                        {model.displayName}
                      </span>
                      {model.description && (
                        <span className="text-[9px] text-[var(--color-text-secondary)]/50 truncate w-full text-left italic">
                          {model.id}
                        </span>
                      )}
                    </div>
                    {selectedModel === model.id && (
                      <Check className="w-3.5 h-3.5 text-tech-accent shrink-0 ml-2" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-[var(--color-text-secondary)] italic">
                  No catalog models found
                </div>
              )}
            </div>
          </div>

          <div className="p-2 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/30 flex justify-center">
            <span className="text-[9px] text-[var(--color-text-secondary)]/40 font-mono italic">
              Dynamic Discovery v2.0
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
