import type { 
  AnalyzeRequest, 
  AnalyzeResponse, 
  PipelineSummary, 
  PipelineDetail 
} from '@archcanvas/shared';
import { ApiError, BadRequestError, NotFoundError, ServerError } from './errors';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 400) throw new BadRequestError(data.error || 'Bad Request', data);
    if (res.status === 404) throw new NotFoundError(data.error || 'Not Found');
    throw new ServerError(data.error || 'Internal Server Error', res.status);
  }
  return res.json();
}

export const apiClient = {
  async analyzeArchitecture(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const res = await fetch('/api/analyze-architecture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<AnalyzeResponse>(res);
  },

  async listPipelines(): Promise<PipelineSummary[]> {
    const res = await fetch('/api/pipelines');
    return handleResponse<PipelineSummary[]>(res);
  },

  async getPipeline(id: string): Promise<PipelineDetail> {
    const res = await fetch(`/api/pipelines/${id}`);
    return handleResponse<PipelineDetail>(res);
  },

  async createPipeline(name: string, canvasState: any): Promise<PipelineDetail> {
    const res = await fetch('/api/pipelines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, canvasState }),
    });
    return handleResponse<PipelineDetail>(res);
  },

  async updatePipeline(id: string, data: Partial<{ name: string; canvasState: any }>): Promise<PipelineDetail> {
    const res = await fetch(`/api/pipelines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<PipelineDetail>(res);
  },

  async deletePipeline(id: string): Promise<void> {
    const res = await fetch(`/api/pipelines/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data.error || 'Delete failed', res.status);
    }
  },
};
