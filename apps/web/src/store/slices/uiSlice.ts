import type { StateCreator } from "zustand";
import type { CanvasState } from "../useCanvasStore";

export interface UISlice {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  rightSidebarTab: "chat" | "insights" | "properties";
  setRightSidebarTab: (tab: "chat" | "insights" | "properties") => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const createUISlice: StateCreator<CanvasState, [], [], UISlice> = (set, get) => ({
  leftSidebarOpen: true,
  rightSidebarOpen: false,
  rightSidebarTab: "chat",
  selectedModel: "gemini-flash-latest",

  toggleLeftSidebar: () => set({ leftSidebarOpen: !get().leftSidebarOpen }),
  toggleRightSidebar: () => set({ rightSidebarOpen: !get().rightSidebarOpen }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setRightSidebarTab: (tab) => set({ rightSidebarTab: tab }),
  setSelectedModel: (model) => set({ selectedModel: model }),
});
