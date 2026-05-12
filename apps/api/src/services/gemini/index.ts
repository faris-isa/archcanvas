import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import { AnalyzeRequest, AnalyzeResponse } from '@archcanvas/shared';
import { PROTOCOL_ANALYSIS_PROMPT, STRUCTURAL_ANALYSIS_PROMPT } from './prompts';

const API_KEY = process.env.GEMINI_API_KEY || '';
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'archcanvas-dev';
const LOCATION = process.env.GCLOUD_LOCATION || 'us-central1';

const getModel = () => {
  if (API_KEY) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
  } else {
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    return vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
  }
};

export const analyzeWithGemini = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const model = getModel();

  const fullPrompt = `
    ${PROTOCOL_ANALYSIS_PROMPT}
    
    ${STRUCTURAL_ANALYSIS_PROMPT}

    Request Data:
    ${JSON.stringify(request)}

    Respond ONLY with JSON in the following format:
    {
      "edges": [
        {
          "edgeId": "string",
          "recommendedProtocol": "string",
          "engineeringExplanation": "string"
        }
      ],
      "suggestions": [
        {
          "title": "string",
          "description": "string",
          "suggestedNodeType": "string",
          "priority": "low | medium | high"
        }
      ]
    }
  `;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const responseText = response.text();
  const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
  
  return JSON.parse(cleanJson) as AnalyzeResponse;
};
