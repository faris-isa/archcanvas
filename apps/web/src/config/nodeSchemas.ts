export type PropertyOption = string;

export interface PropertySchema {
  label: string;
  options: PropertyOption[];
  default: PropertyOption;
}

export type NodeSchema = Record<string, PropertySchema>;

const CORE_PROPERTIES: NodeSchema = {
  'environment': {
    label: 'Environment',
    options: ['edge', 'cloud', 'on-premise'],
    default: 'cloud'
  },
  'network-reliability': {
    label: 'Network Reliability',
    options: ['stable', 'unstable', 'volatile'],
    default: 'stable'
  }
};

const STREAMING_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  'throughput': {
    label: 'Throughput',
    options: ['low', 'medium', 'high', 'extreme'],
    default: 'medium'
  },
  'latency-tolerance': {
    label: 'Latency Tolerance',
    options: ['low', 'medium', 'high'],
    default: 'medium'
  },
  'ordering': {
    label: 'Ordering Guarantee',
    options: ['none', 'partition-level', 'global'],
    default: 'partition-level'
  }
};

const STORAGE_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  'storage-type': {
    label: 'Storage Type',
    options: ['ssd', 'hdd', 'object-storage'],
    default: 'ssd'
  },
  'consistency': {
    label: 'Consistency',
    options: ['eventual', 'strong', 'strict-serializable'],
    default: 'strong'
  },
  'access-pattern': {
    label: 'Access Pattern',
    options: ['read-heavy', 'write-heavy', 'balanced'],
    default: 'balanced'
  }
};

const EDGE_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  'power-source': {
    label: 'Power Source',
    options: ['battery', 'mains', 'poe'],
    default: 'mains'
  },
  'sampling-rate': {
    label: 'Sampling Rate',
    options: ['sub-second', 'seconds', 'minutes', 'hourly'],
    default: 'seconds'
  },
  'connectivity': {
    label: 'Connectivity',
    options: ['wifi', 'ethernet', 'metro-wan', 'fiber', 'cellular', 'lorawan', 'ble'],
    default: 'ethernet'
  }
};

const PROCESSING_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  'parallelism': {
    label: 'Parallelism',
    options: ['low', 'medium', 'high', 'auto-scale'],
    default: 'medium'
  },
  'processing-mode': {
    label: 'Mode',
    options: ['batch', 'stream', 'micro-batch'],
    default: 'stream'
  }
};

const AGENT_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  'batch-size': {
    label: 'Batch Size',
    options: ['100', '1000', '5000', '10000'],
    default: '1000'
  },
  'collection-interval': {
    label: 'Interval',
    options: ['1s', '10s', '30s', '1m'],
    default: '10s'
  }
};

const TSDB_PROPERTIES: NodeSchema = {
  ...STORAGE_PROPERTIES,
  'retention-policy': {
    label: 'Retention',
    options: ['7d', '30d', '90d', 'infinite'],
    default: '30d'
  },
  'precision': {
    label: 'Precision',
    options: ['ns', 'us', 'ms', 's'],
    default: 'ms'
  }
};

const ANALYTICS_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  'compute-tier': {
    label: 'Compute Tier',
    options: ['standard', 'high-perf', 'auto-scaling'],
    default: 'standard'
  },
  'query-priority': {
    label: 'Query Priority',
    options: ['interactive', 'batch'],
    default: 'interactive'
  }
};

const APPLICATION_PROPERTIES: NodeSchema = {
  ...CORE_PROPERTIES,
  'scaling': {
    label: 'Scaling',
    options: ['horizontal', 'vertical', 'serverless'],
    default: 'horizontal'
  },
  'api-style': {
    label: 'API Style',
    options: ['REST', 'GraphQL', 'gRPC-Web', 'WebSockets'],
    default: 'REST'
  },
  'auth': {
    label: 'Authentication',
    options: ['OAuth2', 'API Key', 'None'],
    default: 'OAuth2'
  }
};

export const NODE_SCHEMAS: Record<string, NodeSchema> = {
  // Edge & Sources
  'Factory Floor Sensor': EDGE_PROPERTIES,
  'Edge Gateway': EDGE_PROPERTIES,
  'PLC Controller': EDGE_PROPERTIES,
  'MQTT Client': { ...CORE_PROPERTIES, ...STREAMING_PROPERTIES },
  'OPC-UA Server': { ...CORE_PROPERTIES, ...EDGE_PROPERTIES },
  'HTTP Webhook': CORE_PROPERTIES,

  // Applications & Clients
  'Web Application': APPLICATION_PROPERTIES,
  'Mobile App': APPLICATION_PROPERTIES,
  'Custom Microservice': APPLICATION_PROPERTIES,
  'External API': CORE_PROPERTIES,

  // Agents & Collectors
  'Telegraf': AGENT_PROPERTIES,
  'Fluentd': AGENT_PROPERTIES,
  'Vector': AGENT_PROPERTIES,
  'Prometheus Agent': AGENT_PROPERTIES,

  // Transport & Stream
  'Kafka Cluster': STREAMING_PROPERTIES,
  'RabbitMQ': STREAMING_PROPERTIES,
  'NATS JetStream': STREAMING_PROPERTIES,
  'Cloud Pub/Sub': STREAMING_PROPERTIES,
  'Apache Pulsar': STREAMING_PROPERTIES,
  'Stream Processor': STREAMING_PROPERTIES,

  // Processing
  'Spark Job': PROCESSING_PROPERTIES,
  'Flink Application': PROCESSING_PROPERTIES,
  'Python Script': CORE_PROPERTIES,
  'Lambda Function': PROCESSING_PROPERTIES,

  // Storage & DB
  'PostgreSQL': STORAGE_PROPERTIES,
  'MySQL': STORAGE_PROPERTIES,
  'Cassandra': STORAGE_PROPERTIES,
  'Redis Cache': STORAGE_PROPERTIES,
  'MongoDB': STORAGE_PROPERTIES,
  'InfluxDB': TSDB_PROPERTIES,
  'Prometheus': TSDB_PROPERTIES,
  'ClickHouse': ANALYTICS_PROPERTIES,
  'Snowflake': ANALYTICS_PROPERTIES,
  'BigQuery': ANALYTICS_PROPERTIES,
  'TimescaleDB': TSDB_PROPERTIES,
  'QuestDB': TSDB_PROPERTIES,
  'VictoriaMetrics': TSDB_PROPERTIES,
  'Apache Druid': TSDB_PROPERTIES,
  'kdb+': TSDB_PROPERTIES,
  'Data Lake': STORAGE_PROPERTIES,

  // Industrial & Connectivity
  'Industrial Firewall': CORE_PROPERTIES,
  'VPN Tunnel': CORE_PROPERTIES,
  'Device Management': AGENT_PROPERTIES,
  'Digital Twin': CORE_PROPERTIES,
  'Metro WAN': STREAMING_PROPERTIES,
  'SCADA System': APPLICATION_PROPERTIES,
  'HMI Panel': CORE_PROPERTIES,
  'Industrial Historian': TSDB_PROPERTIES,
  'MES Integration': APPLICATION_PROPERTIES,
  'ERP Connector': APPLICATION_PROPERTIES,
  'LoRaWAN Gateway': EDGE_PROPERTIES,

  'Power BI': ANALYTICS_PROPERTIES,
  'Tableau': ANALYTICS_PROPERTIES,
  'Looker': ANALYTICS_PROPERTIES,
  'Custom Dashboard': CORE_PROPERTIES,



  // Sinks & Alerts
  'Grafana Dashboard': CORE_PROPERTIES,
  'Elasticsearch': STORAGE_PROPERTIES,
  'Slack Webhook': CORE_PROPERTIES,
  'Email Alert': CORE_PROPERTIES,
  'High-Speed Sink': STREAMING_PROPERTIES,
};

export const getDefaultProperties = (nodeType: string): Record<string, string> => {
  const schema = NODE_SCHEMAS[nodeType] || CORE_PROPERTIES;
  const defaults: Record<string, string> = {};
  Object.entries(schema).forEach(([key, value]) => {
    defaults[key] = value.default;
  });
  return defaults;
};
