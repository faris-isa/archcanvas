import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalyzeRequest, AnalyzeResponse } from '@archcanvas/shared';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analyzeWithGemini = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

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
  const responseText = result.response.text();
  return JSON.parse(responseText) as AnalyzeResponse;
};
