import { AnalyzeRequest, AnalyzeResponse } from "@archcanvas/shared";

const LAYER_MAP: { layer: string; keywords: string[] }[] = [
  {
    layer: "Edge Acquisition Layer",
    keywords: [
      "sensor",
      "plc",
      "gateway",
      "opc",
      "mqtt",
      "scada",
      "hmi",
      "historian",
      "edge",
      "factory",
      "lorawan",
      "device",
      "field",
      "modbus",
    ],
  },
  {
    layer: "Transport Layer",
    keywords: [
      "kafka",
      "rabbitmq",
      "nats",
      "pubsub",
      "pulsar",
      "stream buffer",
      "wan",
      "lan",
      "vpn",
      "satellite",
      "5g",
      "lte",
      "metro wan",
      "segment",
      "network",
      "link",
      "tunnel",
    ],
  },
  {
    layer: "Medallion Transformation Engine",
    keywords: [
      "processor",
      "spark",
      "flink",
      "lambda",
      "script",
      "bronze",
      "silver",
      "quality gate",
      "schema registry",
      "transform",
      "stream processor",
      "analytical",
      "telegraf",
      "fluentd",
      "vector",
      "prometheus agent",
    ],
  },
  {
    layer: "Gold Storage Layer",
    keywords: [
      "gold",
      "storage",
      "postgres",
      "mysql",
      "cassandra",
      "redis",
      "mongo",
      "influx",
      "clickhouse",
      "snowflake",
      "bigquery",
      "timescale",
      "questdb",
      "victoria",
      "druid",
      "kdb",
      "data lake",
      "elasticsearch",
      "sink",
    ],
  },
  {
    layer: "Observability & Quality Gate Sinks",
    keywords: [
      "grafana",
      "dashboard",
      "visualization",
      "power bi",
      "tableau",
      "looker",
      "slack",
      "email",
      "alert",
      "webhook",
      "portal",
      "observ",
      "monitoring",
      "custom dashboard",
      "web application",
      "mobile app",
    ],
  },
];

function assignLayer(node: any): string {
  const labelLower = (node.label || "").toLowerCase();
  const categoryLower = (node.category || "").toLowerCase();
  const combined = `${labelLower} ${categoryLower}`;

  for (const { layer, keywords } of LAYER_MAP) {
    if (keywords.some((kw) => combined.includes(kw))) return layer;
  }
  return "Transport Layer"; // sensible default for anything unclassified
}

export const mockAnalyzeArchitecture = async (
  request: AnalyzeRequest,
): Promise<AnalyzeResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response: AnalyzeResponse = {
    edges: request.edges.map((edge) => {
      const sourceCat = (edge.sourceData?.category || "").toLowerCase();
      const targetCat = (edge.targetData?.category || "").toLowerCase();

      let protocol = "MQTT";
      let explanation = "Standard lightweight industrial transport.";

      if (sourceCat.includes("edge") && targetCat.includes("edge")) {
        protocol = "Modbus TCP";
        explanation = "Optimal for floor-level controller-to-controller communication.";
      } else if (sourceCat.includes("edge") && targetCat.includes("industrial")) {
        protocol = "OPC UA";
        explanation = "Industrial-standard connectivity for control system integration.";
      } else if (
        sourceCat.includes("transport") ||
        targetCat.includes("transport") ||
        sourceCat.includes("stream") ||
        targetCat.includes("stream")
      ) {
        protocol = "Kafka Wire Protocol";
        explanation = "Reliable backbone for high-throughput stream processing.";
      } else if (sourceCat.includes("application") || targetCat.includes("application")) {
        protocol = "gRPC";
        explanation = "High-performance protocol for application-level services.";
      } else if (targetCat.includes("storage") || targetCat.includes("db")) {
        protocol = "Native DB Driver";
        explanation = "Use the database's native driver for optimal write throughput.";
      }

      return {
        edgeId: edge.id,
        recommendedProtocol: protocol,
        engineeringExplanation: explanation,
      };
    }),
    suggestions: [
      {
        title: "Add Edge Buffering",
        description:
          "Use an Edge Gateway to buffer sensor data and prevent data loss during WAN outages.",
        priority: "high",
      },
      {
        title: "Enable Schema Registry",
        description:
          "Enforce schema contracts between producers and consumers to prevent pipeline breaks.",
        priority: "medium",
      },
      {
        title: "Add Observability Sink",
        description:
          "Route metrics from all processing nodes to a Grafana dashboard for end-to-end visibility.",
        priority: "medium",
      },
    ],
    grouping: request.nodes
      .filter((n) => n.id && !n.type?.includes("archGroup")) // skip existing group nodes
      .map((n) => ({
        nodeId: n.id,
        groupLabel: assignLayer(n),
      })),
  };

  return response;
};
