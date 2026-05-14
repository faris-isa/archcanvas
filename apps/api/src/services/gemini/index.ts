import { GoogleGenerativeAI } from "@google/generative-ai";
import { VertexAI } from "@google-cloud/vertexai";
import { AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse } from "@archcanvas/shared";
import { ARCHITECT_PROMPT, DATA_ENGINEER_PROMPT, SECURITY_PROMPT, SRE_PROMPT } from "./prompts";

const API_KEY = process.env.GEMINI_API_KEY || "";
const PROJECT_ID = process.env.GCLOUD_PROJECT || "archcanvas-dev";
const LOCATION = process.env.GCLOUD_LOCATION || "us-central1";

const getModel = (modelName: string = "gemini-1.5-flash", jsonMode: boolean = false) => {
  const config = jsonMode ? { responseMimeType: "application/json" } : {};

  if (API_KEY) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI.getGenerativeModel({
      model: modelName,
      generationConfig: config,
    });
  } else {
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    return vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: config,
    });
  }
};

const extractText = (response: any): string => {
  if (typeof response.text === "function") {
    try {
      return response.text();
    } catch (err) {
      console.warn("Gemini SDK: .text() method failed, falling back to manual extraction", err);
    }
  }

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    return candidate.content.parts.map((p: any) => p.text || "").join("");
  }

  return "";
};

let cachedModels: any[] = [];
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

const getAvailableModels = async () => {
  const now = Date.now();
  if (cachedModels.length > 0 && now - lastFetch < CACHE_TTL) {
    return cachedModels;
  }

  try {
    if (!API_KEY) return [];

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      cachedModels = data.models.filter((m: any) =>
        m.supportedGenerationMethods?.includes("generateContent"),
      );
      lastFetch = now;
    }
    return cachedModels;
  } catch (err) {
    console.error("Gemini Discovery Error:", err);
    return [];
  }
};

const resolveDynamicModels = async (requested?: string): Promise<string[]> => {
  const models = await getAvailableModels();

  const flashModels = models
    .filter((m) => m.name.toLowerCase().includes("flash"))
    .sort((a, b) => b.name.localeCompare(a.name));

  const proModels = models
    .filter((m) => m.name.toLowerCase().includes("pro"))
    .sort((a, b) => b.name.localeCompare(a.name));

  const result: string[] = [];
  if (requested) result.push(requested);

  if (flashModels.length > 0) result.push(flashModels[0].name.replace("models/", ""));
  if (proModels.length > 0) result.push(proModels[0].name.replace("models/", ""));

  result.push("gemini-flash-latest", "gemini-pro-latest");

  return Array.from(new Set(result));
};

export const analyzeWithGemini = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const uniqueModels = await resolveDynamicModels(request.model);
  let lastError: any = null;

  for (const modelName of uniqueModels) {
    try {
      const model = getModel(modelName, true);
      console.log(`Performing Quad-Persona Analysis with model: ${modelName}`);

      const context = `\n\nCANVAS STATE:\nNodes: ${JSON.stringify(request.nodes)}\nEdges: ${JSON.stringify(request.edges)}`;

      const tasks = [
        {
          prompt:
            ARCHITECT_PROMPT +
            context +
            `\n\nReturn JSON exactly in this format: { "edges": [{ "edgeId": "...", "recommendedProtocol": "...", "engineeringExplanation": "..." }] }`,
        },
        {
          prompt:
            DATA_ENGINEER_PROMPT +
            context +
            `\n\nCRITICAL: You MUST assign EVERY node (using the exact node "id" field from CANVAS STATE) into one of these 5 architectural layers:\n1. "Edge Acquisition Layer" — sensors, PLCs, gateways, OPC-UA, SCADA, HMI, edge devices\n2. "Transport Layer" — Kafka, RabbitMQ, NATS, Pub/Sub, network segments, VPN, WAN links\n3. "Medallion Transformation Engine" — processors, Spark, Flink, Bronze/Silver layers, Quality Gates, Schema Registry\n4. "Gold Storage Layer" — databases, data lakes, InfluxDB, ClickHouse, Snowflake, storage sinks\n5. "Observability & Quality Gate Sinks" — Grafana, dashboards, alerts, webhooks, visualization portals\n\nReturn JSON exactly in this format (grouping must contain ALL node IDs): { "grouping": [{ "nodeId": "<exact node id>", "groupLabel": "<one of the 5 layers above>" }], "recommendations": [{ "title": "...", "description": "...", "priority": "medium" }] }`,
        },
        {
          prompt:
            SECURITY_PROMPT +
            context +
            `\n\nReturn JSON exactly in this format: { "recommendations": [{ "title": "...", "description": "...", "priority": "high" }] }`,
        },
        {
          prompt:
            SRE_PROMPT +
            context +
            `\n\nReturn JSON exactly in this format: { "recommendations": [{ "title": "...", "description": "...", "priority": "high" }] }`,
        },
      ];

      const results = await Promise.all(tasks.map((t) => model.generateContent(t.prompt)));

      const parsedData = results.map((r) => {
        const text = extractText(r.response)
          .replace(/```json\n?|\n?```/g, "")
          .trim();
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse persona response", e);
          return {};
        }
      });

      return {
        edges: parsedData[0].edges || [],
        grouping: parsedData[1].grouping || [],
        suggestions: [
          ...(parsedData[1].recommendations || []),
          ...(parsedData[2].recommendations || []),
          ...(parsedData[3].recommendations || []),
        ].sort((a, b) => {
          const priorityMap = { high: 0, medium: 1, low: 2 };
          return (
            priorityMap[a.priority as keyof typeof priorityMap] -
            priorityMap[b.priority as keyof typeof priorityMap]
          );
        }),
      };
    } catch (err: any) {
      if (
        err.status === 429 ||
        err.status >= 500 ||
        err.name === "TypeError" ||
        err.message?.includes("fetch failed")
      ) {
        console.warn(
          `Model ${modelName} failed with status ${err.status || "network error"} (e.g. Quota Exceeded/Fetch Failed). Falling back... Error: ${err.message || err}`,
        );
        lastError = err;
        continue;
      }
      console.error(`Model ${modelName} failed with non-recoverable error. Aborting.`);
      throw err;
    }
  }

  throw new Error(
    `Gemini Quad-Persona Analysis Failed on all models. Last Error: ${lastError?.message || lastError}`,
  );
};

export const chatWithGemini = async (request: ChatRequest): Promise<ChatResponse> => {
  const uniqueModels = await resolveDynamicModels(request.model);
  let lastError: any = null;

  for (const modelName of uniqueModels) {
    try {
      const model = getModel(modelName);
      console.log(`Starting Chat Session with model: ${modelName}`);

      const systemContext = `
        You are the "Industrial Engineering Council" (Architect, Data Engineer, Security, and SRE).
        The user is designing an industrial data pipeline.
        
        CURRENT CANVAS STATE:
        Nodes: ${JSON.stringify(request.canvasState.nodes)}
        Edges: ${JSON.stringify(request.canvasState.edges)}
        
        GUIDELINES:
        - Answer as a unified council.
        - Be technical and engineering-focused.
        - Reference specific nodes in the canvas by their labels.
        - If asked to advice on a NEW architecture or MAJOR change, you can suggest a canvas update.
        
        CANVAS UPDATES:
        If you want to suggest architectural changes (new nodes, moved nodes, regrouping, or protocol annotations), append a JSON block at the END of your message wrapped in <canvas_update> tags.
        CRITICAL: Every node MUST include a "category" string and an "intentProperties" object. If you omit these, the frontend will crash.

        GROUPING: Use the "grouping" array to assign nodes to architectural layers. Valid layer names are:
          - "Edge Acquisition Layer"
          - "Transport Layer"
          - "Medallion Transformation Engine"
          - "Gold Storage Layer"
          - "Observability & Quality Gate Sinks"
        ALWAYS include a grouping entry for every node you mention (existing or new).

        EDGE PROTOCOLS: Use the "edgeProtocols" array to annotate connections with the correct wire protocol.
        Reference the edge by its existing id, or use the source→target node ids to identify it.
        Example protocols: "Kafka Wire Protocol", "OPC UA Binary", "MQTT", "gRPC", "REST/HTTP", "JDBC/Native TCP", "CQL/Native TCP", "RESP (Redis Protocol)"

        Format:
        <canvas_update>
        {
          "nodes": [
            { 
              "id": "node-1", 
              "type": "intentNode", 
              "data": { 
                "label": "Apache Flink", 
                "category": "Processing", 
                "intentProperties": { "environment": "cloud", "job": "Stream processing" } 
              }, 
              "position": { "x": 0, "y": 0 } 
            }
          ],
          "edges": [
            { "id": "edge-1", "source": "node-1", "target": "node-2" }
          ],
          "grouping": [
            { "nodeId": "node-1", "groupLabel": "Medallion Transformation Engine" }
          ],
          "edgeProtocols": [
            { "edgeId": "edge-1", "recommendedProtocol": "Kafka Wire Protocol", "engineeringExplanation": "Flink consumes from Kafka topics" }
          ]
        }
        </canvas_update>
      `;

      // Gemini history MUST start with 'user'. Filter out initial assistant greetings.
      const history = request.messages.slice(0, -1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const firstUserIndex = history.findIndex((h) => h.role === "user");
      const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];

      const chat = model.startChat({
        history: validHistory,
        systemInstruction: { role: "system", parts: [{ text: systemContext }] } as any,
      });

      const lastMsg = request.messages[request.messages.length - 1];
      const result = await chat.sendMessage(lastMsg.content);
      const response = await result.response;
      const fullText = extractText(response);

      // Guard against empty/blocked responses (safety filter, finishReason: OTHER, etc.)
      if (!fullText.trim()) {
        const finishReason = response.candidates?.[0]?.finishReason;
        console.warn(
          `Model ${modelName} returned empty content (finishReason: ${finishReason}). Falling back...`,
        );
        lastError = new Error(`Model ${modelName} returned empty response`);
        continue;
      }

      // Extract canvas update if present
      let suggestedNodes = undefined;
      let suggestedEdges = undefined;
      let suggestedGrouping: { nodeId: string; groupLabel: string }[] | undefined = undefined;
      let suggestedEdgeProtocols:
        | { edgeId: string; recommendedProtocol: string; engineeringExplanation: string }[]
        | undefined = undefined;

      const updateMatch = fullText.match(/<canvas_update>([\s\S]*?)<\/canvas_update>/);
      let cleanedText = fullText;

      if (updateMatch) {
        try {
          const updateData = JSON.parse(updateMatch[1].trim());
          suggestedNodes = updateData.nodes;
          suggestedEdges = updateData.edges;
          suggestedGrouping = updateData.grouping;
          suggestedEdgeProtocols = updateData.edgeProtocols;
          cleanedText = fullText.replace(/<canvas_update>[\s\S]*?<\/canvas_update>/, "").trim();
        } catch (e) {
          console.error("Failed to parse suggested canvas update", e);
        }
      }

      return {
        content: cleanedText,
        suggestedNodes,
        suggestedEdges,
        suggestedGrouping,
        suggestedEdgeProtocols,
      };
    } catch (err: any) {
      if (
        err.status === 429 ||
        err.status >= 500 ||
        err.name === "TypeError" ||
        err.message?.includes("fetch failed")
      ) {
        console.warn(
          `Model ${modelName} failed with status ${err.status || "network error"} (e.g. Quota Exceeded/Fetch Failed). Falling back... Error: ${err.message || err}`,
        );
        lastError = err;
        continue;
      }
      console.error(`Model ${modelName} failed with non-recoverable error. Aborting.`);
      throw err;
    }
  }

  throw new Error(
    `Gemini Chat Failed on all models. Last Error: ${lastError?.message || lastError}`,
  );
};
