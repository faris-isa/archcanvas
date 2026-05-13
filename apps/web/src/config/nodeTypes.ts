export const NODE_TYPES = [
  {
    category: "Intent-Based Blueprints",
    types: [
      "Generic Data Source",
      "Stream Buffer",
      "Analytical Processor",
      "Storage Sink",
      "Visualization Portal",
      "LAN Segment",
      "WAN Segment",
      "VPN Tunnel",
      "Satellite Link",
      "5G/LTE Network",
    ],
  },
  {
    category: "Medallion Layers (Data Engineering)",
    types: [
      "Bronze Layer (Raw)",
      "Silver Layer (Cleansed)",
      "Gold Layer (Aggregated)",
      "Data Quality Gate",
      "Schema Registry",
    ],
  },
  {
    category: "Edge & Sources",
    types: [
      "Factory Floor Sensor",
      "Edge Gateway",
      "PLC Controller",
      "LoRaWAN Gateway",
      "MQTT Client",
      "OPC-UA Server",
      "HTTP Webhook",
    ],
  },
  {
    category: "Industrial Systems (SCADA/MES)",
    types: [
      "SCADA System",
      "HMI Panel",
      "Industrial Historian",
      "MES Integration",
      "ERP Connector",
    ],
  },
  {
    category: "Connectivity & Security",
    types: ["Industrial Firewall", "VPN Tunnel", "Device Management", "Metro WAN", "Digital Twin"],
  },
  {
    category: "Applications & Clients",
    types: ["Web Application", "Mobile App", "Custom Microservice", "External API"],
  },
  {
    category: "Agents & Collectors",
    types: ["Telegraf", "Fluentd", "Vector", "Prometheus Agent"],
  },
  {
    category: "Transport & Stream",
    types: [
      "Kafka Cluster",
      "RabbitMQ",
      "NATS JetStream",
      "Cloud Pub/Sub",
      "Apache Pulsar",
      "Stream Processor",
    ],
  },
  {
    category: "Processing",
    types: ["Spark Job", "Flink Application", "Python Script", "Lambda Function"],
  },
  {
    category: "Time-Series & Metrics",
    types: [
      "InfluxDB",
      "Prometheus",
      "TimescaleDB",
      "QuestDB",
      "VictoriaMetrics",
      "Apache Druid",
      "kdb+",
      "Redis Cache",
    ],
  },
  {
    category: "Databases & Storage",
    types: ["PostgreSQL", "MySQL", "Cassandra", "MongoDB", "Data Lake"],
  },
  {
    category: "Analytics & Big Data",
    types: ["ClickHouse", "Snowflake", "BigQuery", "Elasticsearch"],
  },
  {
    category: "Business Intelligence",
    types: ["Power BI", "Tableau", "Looker", "Custom Dashboard"],
  },
  {
    category: "Sinks & Alerts",
    types: ["Grafana Dashboard", "Slack Webhook", "Email Alert", "High-Speed Sink"],
  },
];
