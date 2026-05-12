import { AnalyzeRequest, AnalyzeResponse } from '@archcanvas/shared';

export const mockAnalyzeArchitecture = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const response: AnalyzeResponse = {
    edges: request.edges.map(edge => {
      const sourceCat = edge.sourceData.category;
      const targetCat = edge.targetData.category;

      let protocol = 'gRPC';
      let explanation = 'Default high-performance recommendation.';

      if (sourceCat === 'Edge Devices' && targetCat === 'Storage/Sinks') {
        protocol = 'MQTT';
        explanation = 'MQTT is ideal for low-bandwidth edge-to-cloud telemetry.';
      } else if (sourceCat === 'Edge Devices' && targetCat === 'Transport Layers') {
        protocol = 'OPC UA';
        explanation = 'OPC UA provides industrial-standard connectivity for local processing.';
      } else if (sourceCat === 'Transport Layers' && targetCat === 'Storage/Sinks') {
        protocol = 'Kafka';
        explanation = 'Kafka is the standard for high-throughput stream processing to data lakes.';
      }

      return {
        edgeId: edge.id,
        recommendedProtocol: protocol,
        engineeringExplanation: explanation,
      };
    }),
  };

  return response;
};
