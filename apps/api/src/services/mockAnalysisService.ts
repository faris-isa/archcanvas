import { AnalyzeRequest, AnalyzeResponse } from "@archcanvas/shared";

export const mockAnalyzeArchitecture = async (
  request: AnalyzeRequest,
): Promise<AnalyzeResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response: AnalyzeResponse = {
    edges: request.edges.map((edge) => {
      const sourceCat = edge.sourceData.category;
      const targetCat = edge.targetData.category;

      let protocol = "MQTT";
      let explanation = "Standard lightweight industrial transport.";

      if (sourceCat === "Edge & Sources" && targetCat === "Edge & Sources") {
        protocol = "Modbus TCP";
        explanation = "Optimal for floor-level controller-to-controller communication.";
      } else if (sourceCat === "Edge & Sources" && targetCat === "Industrial Systems") {
        protocol = "OPC UA";
        explanation = "Industrial-standard connectivity for control system integration.";
      } else if (sourceCat.includes("Transport") || targetCat.includes("Transport")) {
        protocol = "Kafka";
        explanation = "Reliable backbone for high-throughput stream processing.";
      } else if (sourceCat.includes("Applications")) {
        protocol = "gRPC";
        explanation = "High-performance protocol for application-level services.";
      }

      return {
        edgeId: edge.id,
        recommendedProtocol: protocol,
        engineeringExplanation: explanation,
      };
    }),
    suggestions: [
      {
        title: "Optimize Sensor Ingestion",
        description: "Use an Edge Gateway to buffer sensor data before sending it over the WAN.",
        priority: "high",
      },
    ],
    grouping: request.nodes.map((n) => {
      const label = n.label.toLowerCase();
      let layer = "Bronze Layer";
      if (label.includes("processor") || label.includes("silver")) layer = "Silver Layer";
      if (label.includes("storage") || label.includes("visualization") || label.includes("gold"))
        layer = "Gold Layer";
      return { nodeId: n.id || "", groupLabel: layer };
    }),
  };

  return response;
};
