import { analyzeWithGemini, chatWithGemini } from "./gemini";
import { mockAnalyzeArchitecture } from "./mockAnalysisService";
import { AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse } from "@archcanvas/shared";

export const analyzeArchitecture = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(request);
    } catch (error: any) {
      // On quota errors, surface to the caller — don't silently serve mock data
      if (error.status === 429) throw error;
      console.error("Gemini analysis failed, falling back to mock:", error);
      return await mockAnalyzeArchitecture(request);
    }
  }
  return await mockAnalyzeArchitecture(request);
};

export const chatWithCouncil = async (request: ChatRequest): Promise<ChatResponse> => {
  if (process.env.GEMINI_API_KEY) {
    return await chatWithGemini(request); // Let callers handle errors with proper status codes
  }
  return { content: "Chat is currently disabled (no API key found)." };
};
