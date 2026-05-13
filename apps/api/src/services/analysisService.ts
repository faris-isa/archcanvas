import { analyzeWithGemini, chatWithGemini } from "./gemini";
import { mockAnalyzeArchitecture } from "./mockAnalysisService";
import { AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse } from "@archcanvas/shared";

export const analyzeArchitecture = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(request);
    } catch (error) {
      console.error("Gemini analysis failed, falling back to mock:", error);
      return await mockAnalyzeArchitecture(request);
    }
  }
  return await mockAnalyzeArchitecture(request);
};

export const chatWithCouncil = async (request: ChatRequest): Promise<ChatResponse> => {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await chatWithGemini(request);
    } catch (error) {
      console.error("Gemini chat failed:", error);
      return { content: "I'm sorry, I'm having trouble reaching the council right now." };
    }
  }
  return { content: "Chat is currently disabled (no API key found)." };
};
