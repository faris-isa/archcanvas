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
    
    Use these properties to make highly specific engineering decisions based on the **Connection Archetype**:
    - **Field-to-Edge (Sensor/PLC -> Gateway)**: Use MQTT, OPC UA, or Modbus. Focus on low overhead and industrial reliability.
    - **Edge-to-Cloud (Gateway -> Broker/Cloud DB)**: Use MQTT (with TLS), HTTPS, or AMQP. Focus on security and WAN traversal.
    - **Agent-to-Pipeline (Telegraf/Fluentd -> Kafka/InfluxDB)**: Use native optimized protocols (e.g., Influx Line Protocol, Kafka Wire Protocol).
    - **Service-to-Service (Backend -> Backend)**: Use gRPC, NATS, or Kafka for high-performance internal communication.
    - **Client-to-App (Web/Mobile -> API)**: Use REST (HTTP/2), GraphQL, or WebSockets for real-time updates.

    **Protocol Constraints**:
    - Never recommend gRPC for field-level sensors or PLCs.
    - Use CoAP for extremely battery-constrained devices.
    - Use DNP3 for Utilities/SCADA contexts.

    Recommend the most appropriate protocol and provide a concise engineering explanation based on the **Connection Archetype** and the specific node properties.

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
