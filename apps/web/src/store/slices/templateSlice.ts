import type { CustomNodeTemplate } from "@archcanvas/shared";
import type { StateCreator } from "zustand";
import type { CanvasState } from "../useCanvasStore";

export interface TemplateSlice {
  customTemplates: CustomNodeTemplate[];
  addCustomTemplate: (template: CustomNodeTemplate) => void;
  removeCustomTemplate: (id: string) => void;
}

export const createTemplateSlice: StateCreator<CanvasState, [], [], TemplateSlice> = (
  set,
  _get,
) => ({
  customTemplates: [],

  addCustomTemplate: (template) =>
    set((state) => ({
      customTemplates: [...state.customTemplates, template],
    })),

  removeCustomTemplate: (id) =>
    set((state) => ({
      customTemplates: state.customTemplates.filter((t) => t.id !== id),
    })),
});
