export type PropertyOption = string;

export interface PropertySchema {
  label: string;
  options: PropertyOption[];
  default: PropertyOption;
  description?: string;
}

export type NodeSchema = Record<string, PropertySchema>;

const CORE_PROPERTIES: NodeSchema = {
  environment: {
    label: "Environment",
    options: ["edge", "cloud", "on-premise"],
    default: "cloud",
    description: "The physical deployment location. Impacts latency and security requirements.",
  },
  "network-reliability": {
    label: "Network Reliability",
    options: ["stable", "unstable", "volatile"],
    default: "stable",
    description:
      "Expected uptime and stability of the link. Unstable links require robust retry logic.",
  },
};

const STREAMING_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  throughput: {
    label: "Throughput",
    options: ["low", "medium", "high", "extreme"],
    default: "medium",
    description:
      "Volume of data per second. High throughput may require specialized transport protocols.",
  },
  "latency-tolerance": {
    label: "Latency Tolerance",
    options: ["low", "medium", "high"],
    default: "medium",
    description:
      "Acceptable delay for data delivery. Low tolerance requires high-speed protocols like gRPC.",
  },
  ordering: {
    label: "Ordering Guarantee",
    options: ["none", "partition-level", "global"],
    default: "partition-level",
    description:
      "Whether data must arrive in the exact order it was sent. Global ordering is expensive.",
  },
};

const STORAGE_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  "storage-type": {
    label: "Storage Type",
    options: ["ssd", "hdd", "object-storage"],
    default: "ssd",
    description: "Underlying storage hardware. Affects IOPS and cost.",
  },
  consistency: {
    label: "Consistency",
    options: ["eventual", "strong", "strict-serializable"],
    default: "strong",
    description: "Trade-off between data accuracy and availability during network partitions.",
  },
  "access-pattern": {
    label: "Access Pattern",
    options: ["read-heavy", "write-heavy", "balanced"],
    default: "balanced",
    description: "Dominant workload type. Helps optimize database indexing and caching.",
  },
};

const EDGE_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  environment: {
    label: "Environment",
    options: ["edge", "cloud", "on-premise"],
    default: "edge",
    description:
      "Physical location of the edge device. Typically remote or constrained environments.",
  },
  "power-source": {
    label: "Power Source",
    options: ["battery", "mains", "poe"],
    default: "mains",
    description:
      "How the device is powered. Battery-powered devices require energy-efficient protocols.",
  },
  "sampling-rate": {
    label: "Sampling Rate",
    options: ["sub-second", "seconds", "minutes", "hourly"],
    default: "seconds",
    description: "Frequency of data collection. High rates increase data volume and network load.",
  },
  connectivity: {
    label: "Connectivity",
    options: ["wifi", "ethernet", "metro-wan", "fiber", "cellular", "lorawan", "ble"],
    default: "ethernet",
    description: "Primary network interface. Impacts range, bandwidth, and power consumption.",
  },
};

const PROCESSING_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  parallelism: {
    label: "Parallelism",
    options: ["low", "medium", "high", "auto-scale"],
    default: "medium",
    description: "Number of concurrent processing tasks. High parallelism speeds up batch jobs.",
  },
  "processing-mode": {
    label: "Mode",
    options: ["batch", "stream", "micro-batch"],
    default: "stream",
    description:
      "How data is processed. Streaming is real-time; batch is for large historical datasets.",
  },
};

const NETWORK_PROPERTIES: NodeSchema = {
  bandwidth: {
    label: "Bandwidth",
    options: ["1Mbps", "100Mbps", "1Gbps", "10Gbps+"],
    default: "100Mbps",
    description: "Maximum data transfer rate of the physical link.",
  },
  latency: {
    label: "Link Latency",
    options: ["ultra-low", "standard", "high (satellite)"],
    default: "standard",
    description: "Physical delay of the link. High latency requires asynchronous protocols.",
  },
  reliability: {
    label: "Reliability (SLA)",
    options: ["best-effort", "99.9%", "99.999%"],
    default: "99.9%",
    description: "Expected uptime. Lower reliability requires local buffering at the source.",
  },
};

const MEDALLION_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  "schema-evolution": {
    label: "Schema Evolution",
    options: ["fail-fast", "allow-extra-fields", "strict-enforcement"],
    default: "allow-extra-fields",
    description: "How to handle changes in source data structure.",
  },
  "data-retention": {
    label: "Retention",
    options: ["30 days", "1 year", "forever"],
    default: "1 year",
    description: "How long to keep data in this specific layer.",
  },
};

const AGENT_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  "batch-size": {
    label: "Batch Size",
    options: ["100", "1000", "5000", "10000"],
    default: "1000",
  },
  "collection-interval": {
    label: "Interval",
    options: ["1s", "10s", "30s", "1m"],
    default: "10s",
  },
};

const TSDB_PROPERTIES: NodeSchema = {
  ...STORAGE_PROPERTIES,
  "retention-policy": {
    label: "Retention",
    options: ["7d", "30d", "90d", "infinite"],
    default: "30d",
  },
  precision: {
    label: "Precision",
    options: ["ns", "us", "ms", "s"],
    default: "ms",
  },
};

const ANALYTICS_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  "compute-tier": {
    label: "Compute Tier",
    options: ["standard", "high-perf", "auto-scaling"],
    default: "standard",
  },
  "query-priority": {
    label: "Query Priority",
    options: ["interactive", "batch"],
    default: "interactive",
  },
};

const APPLICATION_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  scaling: {
    label: "Scaling",
    options: ["horizontal", "vertical", "serverless"],
    default: "horizontal",
  },
  "api-style": {
    label: "API Style",
    options: ["REST", "GraphQL", "gRPC-Web", "WebSockets"],
    default: "REST",
  },
  auth: {
    label: "Authentication",
    options: ["OAuth2", "API Key", "None"],
    default: "OAuth2",
  },
};

export const NODE_SCHEMAS: Record<string, NodeSchema> = {
  // Intent-Based Blueprints
  "Generic Data Source": {
    ...EDGE_PROPERTIES,
    "data-criticality": {
      label: "Criticality",
      options: ["standard", "business-critical", "life-safety"],
      default: "standard",
      description: "How essential this data is. Impacts redundancy and QoS requirements.",
    },
  },
  "Stream Buffer": {
    ...STREAMING_PROPERTIES,
    "retention-period": {
      label: "Retention",
      options: ["minutes", "hours", "days"],
      default: "hours",
      description: "How long data should be buffered if downstream systems are offline.",
    },
  },
  "Analytical Processor": {
    ...PROCESSING_PROPERTIES,
    "algorithm-complexity": {
      label: "Complexity",
      options: ["linear", "compute-heavy", "ai-inference"],
      default: "linear",
      description: "Computational load. High complexity requires more CPU/GPU resources.",
    },
  },
  "Storage Sink": {
    ...STORAGE_PROPERTIES,
    "query-frequency": {
      label: "Query Frequency",
      options: ["rare", "occasional", "continuous"],
      default: "occasional",
      description: "How often data is read. Rare access suggests 'Cold' storage tiers.",
    },
  },
  "Visualization Portal": {
    ...APPLICATION_PROPERTIES,
    "user-concurrency": {
      label: "Concurrent Users",
      options: ["1-10", "10-100", "1000+"],
      default: "1-10",
      description: "Expected number of simultaneous users. Impacts scaling strategy.",
    },
  },
  "LAN Segment": NETWORK_PROPERTIES,
  "WAN Segment": NETWORK_PROPERTIES,
  "VPN Tunnel": {
    ...NETWORK_PROPERTIES,
    encryption: {
      label: "Encryption",
      options: ["AES-256", "WireGuard", "None"],
      default: "AES-256",
      description: "Security level of the tunnel.",
    },
  },
  "Satellite Link": {
    ...NETWORK_PROPERTIES,
    latency: {
      label: "Link Latency",
      options: ["ultra-low", "standard", "high (satellite)"],
      default: "high (satellite)",
      description: "Physical delay of the link. High latency requires asynchronous protocols.",
    },
  },
  "5G/LTE Network": NETWORK_PROPERTIES,

  // Medallion Layers
  "Bronze Layer (Raw)": {
    ...MEDALLION_PROPERTIES,
    "format-conversion": {
      label: "Format",
      options: ["Original", "Parquet", "Avro", "Delta"],
      default: "Original",
      description: "Storage format for raw landing zone.",
    },
  },
  "Silver Layer (Cleansed)": {
    ...MEDALLION_PROPERTIES,
    "data-quality": {
      label: "DQ Level",
      options: ["Basic Null Checks", "Full Validation", "Deduplicated"],
      default: "Full Validation",
      description: "Level of data cleaning applied to this layer.",
    },
  },
  "Gold Layer (Aggregated)": {
    ...MEDALLION_PROPERTIES,
    "aggregation-type": {
      label: "Aggregation",
      options: ["Raw Detail", "Hourly Summary", "KPI Only"],
      default: "Hourly Summary",
      description: "Business-ready data granularity.",
    },
  },
  "Data Quality Gate": {
    ...CORE_PROPERTIES,
    "failure-action": {
      label: "On Failure",
      options: ["Quarantine", "Drop", "Alert & Pass"],
      default: "Quarantine",
      description: "What to do if data fails quality checks.",
    },
  },
  "Schema Registry": {
    ...CORE_PROPERTIES,
    "compatibility-mode": {
      label: "Compatibility",
      options: ["Backward", "Forward", "Full"],
      default: "Full",
      description: "Registry rules for schema updates.",
    },
  },

  // Edge & Sources
  "Factory Floor Sensor": EDGE_PROPERTIES,
  "Edge Gateway": EDGE_PROPERTIES,
  "PLC Controller": EDGE_PROPERTIES,
  "MQTT Client": { ...CORE_PROPERTIES, ...STREAMING_PROPERTIES },
  "OPC-UA Server": { ...CORE_PROPERTIES, ...EDGE_PROPERTIES },
  "HTTP Webhook": CORE_PROPERTIES,

  // Applications & Clients
  "Web Application": APPLICATION_PROPERTIES,
  "Mobile App": APPLICATION_PROPERTIES,
  "Custom Microservice": APPLICATION_PROPERTIES,
  "External API": CORE_PROPERTIES,

  // Agents & Collectors
  Telegraf: AGENT_PROPERTIES,
  Fluentd: AGENT_PROPERTIES,
  Vector: AGENT_PROPERTIES,
  "Prometheus Agent": AGENT_PROPERTIES,

  // Transport & Stream
  "Kafka Cluster": STREAMING_PROPERTIES,
  RabbitMQ: STREAMING_PROPERTIES,
  "NATS JetStream": STREAMING_PROPERTIES,
  "Cloud Pub/Sub": STREAMING_PROPERTIES,
  "Apache Pulsar": STREAMING_PROPERTIES,
  "Stream Processor": STREAMING_PROPERTIES,

  // Processing
  "Spark Job": PROCESSING_PROPERTIES,
  "Flink Application": PROCESSING_PROPERTIES,
  "Python Script": CORE_PROPERTIES,
  "Lambda Function": PROCESSING_PROPERTIES,

  // Storage & DB
  PostgreSQL: STORAGE_PROPERTIES,
  MySQL: STORAGE_PROPERTIES,
  Cassandra: STORAGE_PROPERTIES,
  "Redis Cache": STORAGE_PROPERTIES,
  MongoDB: STORAGE_PROPERTIES,
  InfluxDB: TSDB_PROPERTIES,
  Prometheus: TSDB_PROPERTIES,
  ClickHouse: ANALYTICS_PROPERTIES,
  Snowflake: ANALYTICS_PROPERTIES,
  BigQuery: ANALYTICS_PROPERTIES,
  TimescaleDB: TSDB_PROPERTIES,
  QuestDB: TSDB_PROPERTIES,
  VictoriaMetrics: TSDB_PROPERTIES,
  "Apache Druid": TSDB_PROPERTIES,
  "kdb+": TSDB_PROPERTIES,
  "Data Lake": STORAGE_PROPERTIES,

  // Industrial & Connectivity
  "Industrial Firewall": CORE_PROPERTIES,
  "VPN Tunnel": CORE_PROPERTIES,
  "Device Management": AGENT_PROPERTIES,
  "Digital Twin": CORE_PROPERTIES,
  "Metro WAN": STREAMING_PROPERTIES,
  "SCADA System": APPLICATION_PROPERTIES,
  "HMI Panel": CORE_PROPERTIES,
  "Industrial Historian": TSDB_PROPERTIES,
  "MES Integration": APPLICATION_PROPERTIES,
  "ERP Connector": APPLICATION_PROPERTIES,
  "LoRaWAN Gateway": EDGE_PROPERTIES,

  "Power BI": ANALYTICS_PROPERTIES,
  Tableau: ANALYTICS_PROPERTIES,
  Looker: ANALYTICS_PROPERTIES,
  "Custom Dashboard": CORE_PROPERTIES,

  // Sinks & Alerts
  "Grafana Dashboard": CORE_PROPERTIES,
  Elasticsearch: STORAGE_PROPERTIES,
  "Slack Webhook": CORE_PROPERTIES,
  "Email Alert": CORE_PROPERTIES,
  "High-Speed Sink": STREAMING_PROPERTIES,
};

export const getDefaultProperties = (nodeType: string): Record<string, string> => {
  const schema = NODE_SCHEMAS[nodeType] || CORE_PROPERTIES;
  const defaults: Record<string, string> = {};
  Object.entries(schema).forEach(([key, value]) => {
    defaults[key] = value.default;
  });
  return defaults;
};
