import React from "react";
import { Lightbulb, AlertTriangle, Plus, Info } from "lucide-react";
import { useCanvasStore } from "../../store/useCanvasStore";

export const SuggestionSidebar: React.FC<{ forceOpen?: boolean }> = () => {
  const { suggestions, addNodeByType } = useCanvasStore();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-tech-gray">
      <div className="p-4 border-b border-industrial-gray bg-industrial-gray/20 flex-shrink-0">
        <h2 className="text-sm font-bold text-industrial-gold flex items-center gap-2">
          <Lightbulb size={16} />
          Architect's Insight
        </h2>
        <p className="text-[10px] text-industrial-gray mt-1">
          AI recommendations for a robust pipeline
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <Lightbulb className="text-industrial-gray mb-2 opacity-20" size={32} />
          <p className="text-xs text-industrial-gray font-medium">
            Run Analysis to see architectural suggestions
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border bg-tech-gray/40 relative group transition-all duration-300 hover:border-industrial-gold/50 ${
                suggestion.priority === "high" ? "border-amber-500/30" : "border-industrial-gray"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    suggestion.priority === "high"
                      ? "bg-amber-900/50 text-amber-400"
                      : "bg-industrial-gray/50 text-gray-400"
                  }`}
                >
                  {suggestion.priority} priority
                </span>
                {suggestion.priority === "high" && (
                  <AlertTriangle size={12} className="text-amber-500 animate-pulse" />
                )}
              </div>

              <h3 className="text-xs font-bold text-white mb-1 group-hover:text-industrial-gold transition-colors">
                {suggestion.title}
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">{suggestion.description}</p>

              {suggestion.suggestedNodeType && (
                <button
                  onClick={() => addNodeByType(suggestion.suggestedNodeType!)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 rounded bg-industrial-gray/30 border border-industrial-gray hover:bg-industrial-gold/10 hover:border-industrial-gold/50 transition-all text-[10px] font-bold text-gray-300 hover:text-industrial-gold"
                >
                  <Plus size={12} />
                  Add {suggestion.suggestedNodeType}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-industrial-gray/10 border-t border-industrial-gray flex-shrink-0">
        <div className="flex items-start gap-2 text-[9px] text-gray-500 italic leading-tight">
          <Info size={12} className="shrink-0 mt-0.5" />
          Best practices for industrial data flows.
        </div>
      </div>
    </div>
  );
};
