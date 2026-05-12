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
    You are a Principal Data Architect specializing in Industrial IoT and Cloud Data Platforms. 
    Analyze the following data pipeline connections and recommend the optimal transport protocol for each.
    
    Each node has a set of "intentProperties" which represent its technical constraints and requirements.
    These properties are dynamic and depend on the node type (e.g., Kafka has retention/throughput, PostgreSQL has consistency, Sensors have power/sampling).
    
    Use these properties to make highly specific engineering decisions:
    - **Industrial Edge/Field (PLCs, Sensors, Edge Gateways)**: PRIORITIZE MQTT, OPC UA, or **Modbus TCP** (for legacy hardware). Never recommend gRPC for field-level sensors or PLCs.
    - **Constrained/Battery Devices**: Consider **CoAP** for extremely low-power sensors with limited overhead.
    - **Utilities/SCADA**: Consider **DNP3** for power/water management systems requiring high reliability over long distances.
    - **Cloud/Backend (Microservices, Databases, Streaming)**: Consider Kafka, gRPC, or NATS for high throughput and low latency.
    - **Intermittent Connectivity**: For volatile edge environments, MQTT (with QoS) or CoAP are preferred.

    Recommend the most appropriate protocol (e.g., MQTT, OPC UA, Modbus TCP, CoAP, DNP3, HTTP/2, Kafka, gRPC, WebSockets, AMQP, or NATS).
    Provide a concise engineering explanation for each recommendation based on the provided node properties and the industrial context of the nodes.

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
