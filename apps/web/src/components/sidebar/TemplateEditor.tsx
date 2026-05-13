import React, { useState } from "react";
import { X, Plus, Trash2, Settings2, Info, LayoutDashboard } from "lucide-react";
import { useCanvasStore } from "../../store/useCanvasStore";
import type { CustomNodeTemplate, CustomAttribute } from "@archcanvas/shared";
import { CustomSelect } from "../common/CustomSelect";

interface TemplateEditorProps {
  onClose: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ onClose }) => {
  const addCustomTemplate = useCanvasStore((s) => s.addCustomTemplate);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Edge & Sources");
  const [attributes, setAttributes] = useState<CustomAttribute[]>([
    {
      name: "throughput",
      label: "Throughput",
      type: "select",
      options: ["low", "medium", "high"],
      default: "medium",
    },
  ]);

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      {
        name: `attr_${attributes.length + 1}`,
        label: `Attribute ${attributes.length + 1}`,
        type: "select",
        options: ["option1", "option2"],
        default: "option1",
      },
    ]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, updates: Partial<CustomAttribute>) => {
    const newAttrs = [...attributes];
    newAttrs[index] = { ...newAttrs[index], ...updates };
    setAttributes(newAttrs);
  };

  const handleSave = () => {
    if (!name) return;

    const template: CustomNodeTemplate = {
      id: `template_${Date.now()}`,
      name,
      category,
      attributes,
    };

    addCustomTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-primary)]/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-industrial-gold/10 border border-industrial-gold/30 flex items-center justify-center text-industrial-gold">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-industrial-gold uppercase tracking-tight">
                Industrial Template Designer
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Define custom schemas for proprietary architectural components
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-secondary)] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Form Side */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-[var(--color-border)]">
            {/* Basic Info */}
            <section className="space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-tech-accent border-b border-tech-accent/20 pb-2">
                1. Registry Metadata
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                    Component Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Scada Bridge v2"
                    className="w-full bg-[var(--color-bg-primary)]/40 border border-[var(--color-border)] rounded-md py-2.5 px-4 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-industrial-gold/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                    Category
                  </label>
                  <CustomSelect
                    value={category}
                    options={[
                      "Edge & Sources",
                      "Industrial Systems (SCADA/MES)",
                      "Connectivity & Security",
                      "Applications & Clients",
                      "Agents & Collectors",
                      "Transport & Stream",
                    ]}
                    onChange={setCategory}
                  />
                </div>
              </div>
            </section>

            {/* Attributes */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-industrial-gold/20 pb-2">
                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-industrial-gold">
                  2. Intent Schema Attributes
                </h4>
                <button
                  onClick={addAttribute}
                  className="text-[10px] flex items-center gap-1.5 text-industrial-gold hover:text-white transition-colors uppercase font-bold"
                >
                  <Plus size={14} /> Add Attribute
                </button>
              </div>

              <div className="space-y-4">
                {attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[var(--color-bg-primary)]/30 border border-[var(--color-border)] rounded-lg space-y-4 relative group"
                  >
                    <button
                      onClick={() => removeAttribute(index)}
                      className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase">
                          System Key
                        </label>
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) => updateAttribute(index, { name: e.target.value })}
                          className="w-full bg-black/20 border border-[var(--color-border)] rounded py-1.5 px-3 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase">
                          Display Label
                        </label>
                        <input
                          type="text"
                          value={attr.label}
                          onChange={(e) => updateAttribute(index, { label: e.target.value })}
                          className="w-full bg-black/20 border border-[var(--color-border)] rounded py-1.5 px-3 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase">
                          Control Type
                        </label>
                        <CustomSelect
                          value={attr.type}
                          options={["select", "text"]}
                          onChange={(val) =>
                            updateAttribute(index, { type: val as "select" | "text" })
                          }
                          labels={{
                            select: "Dropdown (Multi-choice)",
                            text: "Input (Custom string)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase">
                          Description / Help Text
                        </label>
                        <input
                          type="text"
                          value={attr.description || ""}
                          onChange={(e) => updateAttribute(index, { description: e.target.value })}
                          placeholder="e.g. Volume of data per second. High throughput may require specialized transport."
                          className="w-full bg-black/20 border border-[var(--color-border)] rounded py-2 px-3 text-xs italic text-[var(--color-text-primary)] focus:outline-none focus:border-industrial-gold/50 transition-all"
                        />
                      </div>
                    </div>

                    {attr.type === "select" && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase">
                          Options (Comma separated)
                        </label>
                        <input
                          type="text"
                          value={attr.options?.join(", ")}
                          onChange={(e) =>
                            updateAttribute(index, {
                              options: e.target.value.split(",").map((s) => s.trim()),
                            })
                          }
                          placeholder="low, medium, high"
                          className="w-full bg-black/20 border border-[var(--color-border)] rounded py-1.5 px-3 text-xs italic"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Preview Side */}
          <div className="w-80 bg-[var(--color-bg-primary)] border-l border-[var(--color-border)] p-8 flex flex-col items-center gap-8 shadow-inner">
            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--color-text-secondary)] w-full text-center">
              Live Inspector Preview
            </h4>

            <div className="w-full p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl space-y-6 shadow-xl">
              <div className="flex flex-col gap-1 border-b border-[var(--color-border)] pb-4">
                <span className="text-[9px] uppercase tracking-widest text-tech-accent font-black">
                  Preview Mode
                </span>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  {name || "Untitled Component"}
                </h2>
                <span className="text-[10px] text-[var(--color-text-secondary)] italic uppercase">
                  {category}
                </span>
              </div>

              <div className="space-y-6">
                {attributes.map((attr, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {attr.label}
                        {attr.description && (
                          <div className="group/tooltip relative inline-block">
                            <Info
                              size={10}
                              className="text-tech-accent/40 hover:text-tech-accent transition-colors cursor-help"
                            />
                            <div className="absolute left-0 bottom-full mb-1 w-48 p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded shadow-2xl text-[8px] text-[var(--color-text-primary)] leading-tight opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all z-50 normal-case font-medium">
                              {attr.description}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="bg-tech-accent/10 text-tech-accent text-[8px] px-1 rounded border border-tech-accent/20">
                        INTENT
                      </span>
                    </label>
                    {attr.type === "select" ? (
                      <div className="grid grid-cols-1 gap-1">
                        {attr.options?.map((opt) => (
                          <div
                            key={opt}
                            className={`py-1.5 px-3 text-[9px] font-bold rounded border text-center uppercase tracking-widest ${
                              opt === attr.default
                                ? "bg-tech-accent/20 border-tech-accent text-tech-accent shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                                : "bg-black/10 border-[var(--color-border)] text-[var(--color-text-secondary)] opacity-50"
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full bg-black/10 border border-[var(--color-border)] rounded py-1.5 px-3 text-[10px] text-[var(--color-text-secondary)] italic">
                        User input field...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto w-full p-4 bg-industrial-gold/5 border border-industrial-gold/20 rounded-lg flex items-start gap-3">
              <Info size={14} className="text-industrial-gold shrink-0 mt-0.5" />
              <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed italic">
                Custom nodes inherit standard analysis rules based on their category and intent
                mapping.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md text-sm font-bold text-[var(--color-text-secondary)] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name}
            className={`px-8 py-2 rounded-md text-sm font-bold transition-all ${
              name
                ? "bg-industrial-gold text-black hover:bg-yellow-500 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                : "bg-industrial-gray/20 text-industrial-gray cursor-not-allowed border border-industrial-gray/20"
            }`}
          >
            Register Template
          </button>
        </div>
      </div>
    </div>
  );
};
