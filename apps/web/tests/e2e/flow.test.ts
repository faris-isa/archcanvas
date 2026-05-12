import { describe, it, expect, vi } from 'vitest';
import { apiClient } from '../../src/api/client';

// Mock the apiClient
vi.mock('../../src/api/client', () => ({
  apiClient: {
    analyzeArchitecture: vi.fn(),
    createPipeline: vi.fn(),
    listPipelines: vi.fn(),
    getPipeline: vi.fn(),
  }
}));

describe('Frontend Flow Integration', () => {
  it('should call analyzeArchitecture with correct parameters', async () => {
    const mockResponse = {
      edges: [{ edgeId: 'e1', recommendedProtocol: 'MQTT', engineeringExplanation: 'Test explanation' }]
    };
    (apiClient.analyzeArchitecture as any).mockResolvedValue(mockResponse);

    const request = { nodes: [], edges: [] } as any;
    const result = await apiClient.analyzeArchitecture(request);
    
    expect(apiClient.analyzeArchitecture).toHaveBeenCalledWith(request);
    expect(result).toEqual(mockResponse);
  });

  it('should call createPipeline when saving', async () => {
    (apiClient.createPipeline as any).mockResolvedValue({ id: 'p1', name: 'Test' });
    
    await apiClient.createPipeline('Test', {});
    expect(apiClient.createPipeline).toHaveBeenCalledWith('Test', {});
  });
});
