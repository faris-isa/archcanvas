import { GoogleGenerativeAI } from "@google/generative-ai";
import { VertexAI } from "@google-cloud/vertexai";
import { AnalyzeRequest, AnalyzeResponse } from "@archcanvas/shared";
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
  const modelName = uniqueModels[0];
  const model = getModel(modelName, true);

  const connectionList = request.edges
    .map(
      (e) =>
        `- Connection ID: ${e.id}\n  Source: [${e.sourceData.category}] ${e.sourceData.label}\n  Target: [${e.targetData.category}] ${e.targetData.label}`,
    )
    .join("\n\n");

  const systemState = JSON.stringify(request.nodes);

  const tasks = [
    {
      name: "Architect",
      prompt: `${ARCHITECT_PROMPT}\n\nCONNECTIONS:\n${connectionList}\n\nRespond ONLY with JSON: { "edges": [{ "edgeId": "id", "recommendedProtocol": "string", "engineeringExplanation": "string" }] }`,
    },
    {
      name: "Data Engineer",
      prompt: `${DATA_ENGINEER_PROMPT}\n\nSYSTEM STATE:\n${systemState}\n\nRespond ONLY with JSON: { "grouping": [{ "nodeId": "id", "groupLabel": "string" }], "recommendations": [{ "title": "string", "description": "string", "priority": "low|medium|high" }] }`,
    },
    {
      name: "Security",
      prompt: `${SECURITY_PROMPT}\n\nSYSTEM STATE:\n${systemState}\n\nRespond ONLY with JSON: { "recommendations": [{ "title": "Security: string", "description": "string", "priority": "high" }] }`,
    },
    {
      name: "SRE",
      prompt: `${SRE_PROMPT}\n\nSYSTEM STATE:\n${systemState}\n\nRespond ONLY with JSON: { "recommendations": [{ "title": "SRE: string", "description": "string", "priority": "medium" }] }`,
    },
  ];

  try {
    console.log(`Performing Quad-Persona Analysis with model: ${modelName}`);

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
    console.error("Gemini Quad-Persona Analysis Failed:", err);
    throw err;
  }
};

export const chatWithGemini = async (request: ChatRequest): Promise<ChatResponse> => {
  const uniqueModels = await resolveDynamicModels(request.model);
  const modelName = uniqueModels[0];
  const model = getModel(modelName);

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
    If you want to suggest a new set of nodes and edges, append a JSON block at the END of your message wrapped in <canvas_update> tags.
    Format:
    <canvas_update>
    {
      "nodes": [
        { "id": "node-1", "type": "intentNode", "data": { "label": "PLC", "category": "Edge & Sources", "intentProperties": {} }, "position": { "x": 0, "y": 0 } }
      ],
      "edges": [
        { "id": "edge-1", "source": "node-1", "target": "node-2" }
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

  // Extract canvas update if present
  let suggestedNodes = undefined;
  let suggestedEdges = undefined;

  const updateMatch = fullText.match(/<canvas_update>([\s\S]*?)<\/canvas_update>/);
  let cleanedText = fullText;

  if (updateMatch) {
    try {
      const updateData = JSON.parse(updateMatch[1].trim());
      suggestedNodes = updateData.nodes;
      suggestedEdges = updateData.edges;
      cleanedText = fullText.replace(/<canvas_update>[\s\S]*?<\/canvas_update>/, "").trim();
    } catch (e) {
      console.error("Failed to parse suggested canvas update", e);
    }
  }

  return {
    content: cleanedText,
    suggestedNodes,
    suggestedEdges,
  };
};
