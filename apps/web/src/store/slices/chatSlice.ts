import type { StateCreator } from "zustand";
import type { CanvasState } from "../useCanvasStore";

export interface ChatSlice {
  chatMessages: any[];
  addChatMessage: (msg: any) => void;
  clearChat: () => void;
  isChatTyping: boolean;
  setIsChatTyping: (isTyping: boolean) => void;
}

export const createChatSlice: StateCreator<CanvasState, [], [], ChatSlice> = (set, get) => ({
  chatMessages: [
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! We are the Engineering Council (Architect, Data Engineer, Security, and SRE). How can we help you audit your design today?",
      timestamp: new Date(),
    },
  ],
  isChatTyping: false,

  addChatMessage: (msg) => {
    set({
      chatMessages: [...get().chatMessages, msg],
    });
  },

  clearChat: () => {
    set({
      chatMessages: [],
    });
  },

  setIsChatTyping: (isChatTyping) => set({ isChatTyping }),
});
