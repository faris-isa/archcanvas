import { analyzeWithGemini } from './geminiService';
import { mockAnalyzeArchitecture } from './mockAnalysisService';
import { AnalyzeRequest, AnalyzeResponse } from '@archcanvas/shared';

export const analyzeArchitecture = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(request);
    } catch (error) {
      console.error('Gemini analysis failed, falling back to mock:', error);
      return await mockAnalyzeArchitecture(request);
    }
  }
  return await mockAnalyzeArchitecture(request);
};
