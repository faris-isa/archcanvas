import { GoogleGenerativeAI } from "@google/generative-ai";
import { VertexAI } from "@google-cloud/vertexai";
import { AnalyzeRequest, AnalyzeResponse } from "@archcanvas/shared";
import { PROTOCOL_ANALYSIS_PROMPT, STRUCTURAL_ANALYSIS_PROMPT } from "./prompts";

const API_KEY = process.env.GEMINI_API_KEY || "";
const PROJECT_ID = process.env.GCLOUD_PROJECT || "archcanvas-dev";
const LOCATION = process.env.GCLOUD_LOCATION || "us-central1";

const getModel = (modelName: string = "gemini-1.5-flash") => {
  if (API_KEY) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" },
    });
  } else {
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    return vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" },
    });
  }
};

/**
 * Safely extracts text from a Gemini response, handling differences between
 * @google/generative-ai and @google-cloud/vertexai SDKs.
 */
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

  // Sort models by name descending to get newest versions first (e.g., 3.1 > 2.5 > 1.5)
  const flashModels = models
    .filter((m) => m.name.toLowerCase().includes("flash"))
    .sort((a, b) => b.name.localeCompare(a.name));

  const proModels = models
    .filter((m) => m.name.toLowerCase().includes("pro"))
    .sort((a, b) => b.name.localeCompare(a.name));

  const result: string[] = [];
  if (requested) result.push(requested);

  // Add newest Flash
  if (flashModels.length > 0) result.push(flashModels[0].name.replace("models/", ""));
  // Add newest Pro
  if (proModels.length > 0) result.push(proModels[0].name.replace("models/", ""));

  // Fallbacks for known stable aliases
  result.push("gemini-flash-latest", "gemini-pro-latest");

  return Array.from(new Set(result));
};

export const analyzeWithGemini = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const uniqueModels = await resolveDynamicModels(request.model);

  const connectionList = request.edges
    .map(
      (e) =>
        `- Connection ID: ${e.id}\n  Source: [${e.sourceData.category}] ${e.sourceData.label}\n  Target: [${e.targetData.category}] ${e.targetData.label}`,
    )
    .join("\n\n");

  const fullPrompt = `
    ${PROTOCOL_ANALYSIS_PROMPT}
    
    ${STRUCTURAL_ANALYSIS_PROMPT}

    DATA TO ANALYZE:
    ${connectionList}

    FULL SYSTEM STATE (FOR STRUCTURAL CONTEXT):
    ${JSON.stringify(request.nodes)}

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

  let lastError: any;

  for (const modelName of uniqueModels) {
    try {
      console.log(`Attempting Gemini analysis with model: ${modelName}`);
      const model = getModel(modelName);
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = extractText(response);
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanJson) as AnalyzeResponse;
    } catch (err: any) {
      lastError = err;

      const isRetryable = err.status === 404 || err.status === 503 || err.status === 429;

      if (isRetryable && modelName !== uniqueModels[uniqueModels.length - 1]) {
        console.warn(
          `Gemini model ${modelName} failed (Status: ${err.status}), trying next fallback...`,
        );
        continue;
      }

      console.error(`Gemini SDK Detailed Error (Model: ${modelName}):`, {
        message: err.message,
        status: err.status,
        statusText: err.statusText,
        errorDetails: err.errorDetails,
      });
      break;
    }
  }

  throw lastError;
};
