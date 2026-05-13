import React from "react";
import { Search, X, ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import { PipelineList } from "./PipelineList";
import { NODE_TYPES } from "../../config/nodeTypes";
import { getNodeIcon } from "../../utils/nodeIcons";
import { useCanvasStore } from "../../store/useCanvasStore";
import { Shortcut } from "../common/Shortcut";

import { TemplateEditor } from "./TemplateEditor";

export const NodeLibrary: React.FC = () => {
  const { customTemplates, leftSidebarOpen, toggleLeftSidebar, addNodeByType } = useCanvasStore();
  const [isCreatingTemplate, setIsCreatingTemplate] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [collapsedCategories, setCollapsedCategories] = React.useState<Record<string, boolean>>({});

  const isOpen = leftSidebarOpen;
  const setIsOpen = toggleLeftSidebar;

  const onDragStart = (event: React.DragEvent, nodeType: string, category: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/category", category);
    event.dataTransfer.effectAllowed = "move";
  };

  const allNodeTypes = [
    ...NODE_TYPES,
    ...(customTemplates.length > 0
      ? [{ category: "Custom Components", types: customTemplates.map((t) => t.name) }]
      : []),
  ];

  const filteredNodeTypes = allNodeTypes
    .map((cat) => ({
      ...cat,
      types: cat.types.filter(
        (type) =>
          type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.category.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.types.length > 0);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div
      className={`relative h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] transition-all duration-500 ease-in-out flex flex-shrink-0 ${
        isOpen ? "w-72" : "w-0"
      }`}
    >
      {/* Toggle Handle (The "Folder" Tab) */}
      <button
        onClick={() => setIsOpen()}
        className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-24 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] border-l-0 rounded-r-lg flex items-center justify-center group hover:bg-[var(--color-bg-primary)] transition-colors shadow-[4px_0_10px_rgba(0,0,0,0.3)] z-10"
        title={isOpen ? "Collapse Library" : "Expand Library"}
      >
        {isOpen ? (
          <ChevronLeft
            size={16}
            className="text-industrial-gray group-hover:text-industrial-gold transition-colors"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <LayoutDashboard size={12} className="text-industrial-gold" />
            <ChevronRight
              size={16}
              className="text-industrial-gray group-hover:text-industrial-gold transition-colors"
            />
          </div>
        )}
      </button>

      {/* Main Content */}
      <div
        className={`flex flex-col h-full w-72 overflow-hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-6 border-b border-[var(--color-border)] space-y-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-industrial-gold tracking-tight">
                Node Library
              </h2>
              <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mt-1 font-semibold">
                Architectural Components
              </p>
            </div>
            <Shortcut keys={["Ctrl", "B"]} className="opacity-30 mt-2" />
          </div>

          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-gray group-focus-within:text-tech-accent transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-bg-primary)]/40 border border-[var(--color-border)] rounded-md py-2 pl-9 pr-8 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-tech-accent/50 focus:ring-1 focus:ring-tech-accent/20 transition-all placeholder:text-industrial-gray"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-industrial-gray hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsCreatingTemplate(true)}
            className="w-full py-2 bg-industrial-gold/10 border border-industrial-gold/30 rounded-md text-[10px] font-bold text-industrial-gold uppercase tracking-widest hover:bg-industrial-gold/20 hover:border-industrial-gold/50 transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={12} />
            Create Custom Node
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-[var(--color-border)]">
          {filteredNodeTypes.length > 0 ? (
            filteredNodeTypes.map((cat) => (
              <div
                key={cat.category}
                className="space-y-2 border-b border-[var(--color-border)]/30 pb-2 last:border-0"
              >
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className="w-full text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)] font-black flex items-center justify-between hover:text-industrial-gold transition-colors py-1"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1 h-1 rounded-full ${
                        cat.category === "Custom Components"
                          ? "bg-industrial-gold"
                          : "bg-tech-accent"
                      }`}
                    ></span>
                    {cat.category}
                  </div>
                  {collapsedCategories[cat.category] ? (
                    <ChevronRight size={10} className="text-industrial-gray" />
                  ) : (
                    <ChevronLeft size={10} className="rotate-[270deg] text-industrial-gray" />
                  )}
                </button>

                {!collapsedCategories[cat.category] && (
                  <div className="grid grid-cols-1 gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                    {cat.types.map((type) => (
                      <div
                        key={type}
                        className="group relative bg-[var(--color-bg-primary)]/40 border border-[var(--color-border)] p-3 rounded-lg cursor-grab hover:border-tech-accent/50 hover:bg-[var(--color-bg-primary)] transition-all duration-200 flex items-center gap-3 overflow-hidden"
                        onDragStart={(event) => onDragStart(event, type, cat.category)}
                        onClick={() => addNodeByType(type)}
                        draggable
                      >
                        <div className="text-[var(--color-text-secondary)] group-hover:text-tech-accent transition-colors">
                          {getNodeIcon(type)}
                        </div>
                        <span className="text-[13px] font-medium text-[var(--color-text-primary)] group-hover:translate-x-0.5 transition-transform">
                          {type}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addNodeByType(type);
                          }}
                          className="ml-auto opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md transition-all text-industrial-gold"
                          title="Add to canvas"
                        >
                          <LayoutDashboard size={14} />
                        </button>

                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 scale-y-0 group-hover:scale-y-100 transition-transform origin-top ${
                            cat.category === "Custom Components"
                              ? "bg-industrial-gold"
                              : "bg-tech-accent"
                          }`}
                        ></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
              <Search size={32} className="text-industrial-gray mb-2" />
              <p className="text-xs text-industrial-gray">
                No nodes found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/20 flex-shrink-0">
          <PipelineList />
        </div>
      </div>

      {/* Template Editor Modal */}
      {isCreatingTemplate && <TemplateEditor onClose={() => setIsCreatingTemplate(false)} />}
    </div>
  );
};
