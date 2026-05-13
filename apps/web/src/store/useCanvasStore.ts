import { create } from "zustand";
import { createCanvasSlice, type CanvasSlice } from "./slices/canvasSlice";
import { createChatSlice, type ChatSlice } from "./slices/chatSlice";
import { createUISlice, type UISlice } from "./slices/uiSlice";
import { createTemplateSlice, type TemplateSlice } from "./slices/templateSlice";
import { createAnalysisSlice, type AnalysisSlice } from "./slices/analysisSlice";

export type CanvasState = CanvasSlice & ChatSlice & UISlice & TemplateSlice & AnalysisSlice;

export const useCanvasStore = create<CanvasState>((...a) => ({
  ...createCanvasSlice(...a),
  ...createChatSlice(...a),
  ...createUISlice(...a),
  ...createTemplateSlice(...a),
  ...createAnalysisSlice(...a),
}));
