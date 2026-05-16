import { GoogleGenerativeAI } from "@google/generative-ai";
import { VertexAI } from "@google-cloud/vertexai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const PROJECT_ID = process.env.GCLOUD_PROJECT || "archcanvas-dev";
const LOCATION = process.env.GCLOUD_LOCATION || "us-central1";

export const getModel = (modelName: string = "gemini-1.5-flash", jsonMode: boolean = false) => {
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

export const extractText = (response: any): string => {
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

export const resolveDynamicModels = async (requested?: string): Promise<string[]> => {
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
