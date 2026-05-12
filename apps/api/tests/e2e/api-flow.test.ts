import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { analyzeArchitecture } from '../../src/services/analysisService';
import { AnalyzeRequest } from '@archcanvas/shared';

describe('API Integration Flow', () => {
  it('should return mock recommendations when no API key is present', async () => {
    const request: AnalyzeRequest = {
      nodes: [
        { label: 'Sensor', category: 'Edge Devices', intentProperties: { 'throughput-rate': 'low', environment: 'edge', 'latency-tolerance': 'low', 'network-reliability': 'stable' } },
        { label: 'Lake', category: 'Storage/Sinks', intentProperties: { 'throughput-rate': 'high', environment: 'cloud', 'latency-tolerance': 'high', 'network-reliability': 'stable' } }
      ],
      edges: [
        { 
          id: 'e1', 
          source: 'n1', 
          target: 'n2', 
          sourceData: { label: 'Sensor', category: 'Edge Devices', intentProperties: { 'throughput-rate': 'low', environment: 'edge', 'latency-tolerance': 'low', 'network-reliability': 'stable' } },
          targetData: { label: 'Lake', category: 'Storage/Sinks', intentProperties: { 'throughput-rate': 'high', environment: 'cloud', 'latency-tolerance': 'high', 'network-reliability': 'stable' } }
        }
      ]
    };

    const response = await analyzeArchitecture(request);
    expect(response.edges).toHaveLength(1);
    expect(response.edges[0].recommendedProtocol).toBeDefined();
    expect(response.edges[0].engineeringExplanation).toBeDefined();
  });
});
