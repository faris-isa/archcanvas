export const OFFSHORE_RIG_EXAMPLE = {
  nodes: [
    {
      id: "sensor-1",
      type: "intentNode",
      position: { x: 0, y: 150 },
      data: {
        label: "Factory Floor Sensor",
        category: "Edge & Sources",
        intentProperties: {
          "throughput-rate": "low",
          environment: "edge",
          reliability: "99.9%",
        },
      },
    },
    {
      id: "gateway-1",
      type: "intentNode",
      position: { x: 300, y: 150 },
      data: {
        label: "Edge Gateway",
        category: "Edge & Sources",
        intentProperties: {
          "processing-power": "medium",
          "local-storage": "100GB",
        },
      },
    },
    {
      id: "sat-link",
      type: "intentNode",
      position: { x: 600, y: 150 },
      data: {
        label: "Satellite Link",
        category: "Intent-Based Blueprints",
        intentProperties: {
          bandwidth: "1Mbps",
          latency: "high (satellite)",
          reliability: "best-effort",
        },
      },
    },
    {
      id: "buffer-1",
      type: "intentNode",
      position: { x: 900, y: 150 },
      data: {
        label: "Cloud Pub/Sub",
        category: "Transport & Stream",
        intentProperties: {
          "throughput-rate": "high",
          "retention-period": "days",
        },
      },
    },
    {
      id: "processor-1",
      type: "intentNode",
      position: { x: 1200, y: 50 },
      data: {
        label: "Stream Processor",
        category: "Transport & Stream",
        intentProperties: {
          parallelism: "medium",
          "processing-mode": "stream",
        },
      },
    },
    {
      id: "storage-1",
      type: "intentNode",
      position: { x: 1500, y: 50 },
      data: {
        label: "InfluxDB",
        category: "Storage & DB",
        intentProperties: {
          "storage-tier": "hot",
          retention: "30 days",
        },
      },
    },
    {
      id: "alert-1",
      type: "intentNode",
      position: { x: 1500, y: 250 },
      data: {
        label: "Slack Webhook",
        category: "Sinks & Alerts",
        intentProperties: {
          priority: "high",
        },
      },
    },
  ],
  edges: [
    { id: "e1", source: "sensor-1", target: "gateway-1", type: "protocolEdge" },
    {
      id: "e2",
      source: "gateway-1",
      target: "sat-link",
      type: "protocolEdge",
      style: { strokeDasharray: "5,5", strokeWidth: 2 },
    },
    {
      id: "e3",
      source: "sat-link",
      target: "buffer-1",
      type: "protocolEdge",
      style: { strokeDasharray: "5,5", strokeWidth: 2 },
    },
    { id: "e4", source: "buffer-1", target: "processor-1", type: "protocolEdge" },
    { id: "e5", source: "processor-1", target: "storage-1", type: "protocolEdge" },
    { id: "e6", source: "processor-1", target: "alert-1", type: "protocolEdge" },
  ],
};
