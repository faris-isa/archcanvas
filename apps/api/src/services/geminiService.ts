import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import { AnalyzeRequest, AnalyzeResponse } from '@archcanvas/shared';

const API_KEY = process.env.GEMINI_API_KEY || '';
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'archcanvas-dev';
const LOCATION = process.env.GCLOUD_LOCATION || 'us-central1';

export const analyzeWithGemini = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  let model: any;

  if (API_KEY) {
    // Use Google AI (AI Studio) with API Key
    const genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });
  } else {
    // Use Vertex AI (Google Cloud) with ADC
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });
  }

  const prompt = `
    You are a Principal Data Architect. 
    Analyze the following data pipeline connections and recommend the optimal transport protocol for each.
    
    Node Properties involve:
    - throughput-rate: low, medium, high
    - environment: edge, cloud
    - latency-tolerance: low, medium, high
    - network-reliability: stable, unstable, volatile

    Recommend one of: MQTT, OPC UA, Kafka, gRPC, WebSockets, or HTTP/2.
    Provide a concise engineering explanation for each recommendation.

    Request Data:
    ${JSON.stringify(request)}

    Respond with JSON in the following format:
    {
      "edges": [
        {
          "edgeId": "string",
          "recommendedProtocol": "string",
          "engineeringExplanation": "string"
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  
  // Strip code blocks if AI included them
  const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson) as AnalyzeResponse;
};
