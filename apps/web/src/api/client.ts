import type {
  AnalyzeRequest,
  AnalyzeResponse,
  PipelineSummary,
  PipelineDetail,
  ChatRequest,
  ChatResponse,
} from "@archcanvas/shared";
import { ApiError, BadRequestError, NotFoundError, RateLimitError, ServerError } from "./errors";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 400) throw new BadRequestError(data.error || "Bad Request", data);
    if (res.status === 404) throw new NotFoundError(data.error || "Not Found");
    if (res.status === 429)
      throw new RateLimitError(data.error || "Rate limit exceeded", data.retryAfter);
    throw new ServerError(data.error || "Internal Server Error", res.status);
  }
  return res.json();
}

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const apiClient = {
  async analyzeArchitecture(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const res = await fetch(`${BASE_URL}/api/analyze-architecture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return handleResponse<AnalyzeResponse>(res);
  },

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return handleResponse<ChatResponse>(res);
  },

  async exportArchitecture(request: AnalyzeRequest): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/export-architecture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`Export failed: ${res.statusText}`);
    }

    return res.text();
  },

  async listPipelines(): Promise<PipelineSummary[]> {
    const res = await fetch(`${BASE_URL}/api/pipelines`);
    return handleResponse<PipelineSummary[]>(res);
  },

  async getPipeline(id: string): Promise<PipelineDetail> {
    const res = await fetch(`${BASE_URL}/api/pipelines/${id}`);
    return handleResponse<PipelineDetail>(res);
  },

  async createPipeline(name: string, canvasState: any): Promise<PipelineDetail> {
    const res = await fetch(`${BASE_URL}/api/pipelines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, canvasState }),
    });
    return handleResponse<PipelineDetail>(res);
  },

  async updatePipeline(
    id: string,
    data: Partial<{ name: string; canvasState: any }>,
  ): Promise<PipelineDetail> {
    const res = await fetch(`${BASE_URL}/api/pipelines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<PipelineDetail>(res);
  },

  async deletePipeline(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/pipelines/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data.error || "Delete failed", res.status);
    }
  },

  async getGeminiModels(): Promise<{ status: string; models: any[] }> {
    const res = await fetch(`${BASE_URL}/api/diagnostic/gemini`);
    return handleResponse<{ status: string; models: any[] }>(res);
  },

  async getHealth(): Promise<{ status: string; mockMode: boolean }> {
    const res = await fetch(`${BASE_URL}/api/health`);
    return handleResponse<{ status: string; mockMode: boolean }>(res);
  },
};
