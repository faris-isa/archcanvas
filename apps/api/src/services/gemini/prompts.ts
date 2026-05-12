export const PROTOCOL_ANALYSIS_PROMPT = `
You are a Principal Data Architect specializing in Industrial IoT and Cloud Data Platforms. 
Analyze the following data pipeline connections and recommend the optimal transport protocol for each.

Each node has "intentProperties" representing technical constraints.

**STRICT PROTOCOL SELECTION MATRIX (MANDATORY)**:

| Source Category | Target Category | Allowed Protocols (PICK ONE) |
| :--- | :--- | :--- |
| Edge & Sources | Edge & Sources | Modbus TCP, IO-Link, OPC UA |
| Edge & Sources | Industrial Systems | OPC UA, Modbus TCP, MQTT |
| Edge & Sources | Connectivity & Security | MQTT, OPC UA |
| Industrial Systems | Industrial Systems | OPC UA, Modbus TCP, MQTT |
| Connectivity & Security | Transport & Stream | MQTT, AMQP, Kafka Wire Protocol |
| Transport & Stream | Storage & DB | Kafka Wire Protocol, Influx Line Protocol |
| Applications & Clients | Applications & Clients | gRPC, REST, WebSockets, NATS |
| Processing | Transport & Stream | Kafka Wire Protocol, NATS |

**HARD CONSTRAINTS**:
- **STRICTLY FORBIDDEN**: Never recommend gRPC, GraphQL, or REST for "Edge & Sources" or "Industrial Systems". 
- **Industrial Historian**: Always recommend OPC UA or MQTT for ingestion into a Historian.
- **Sensor-to-PLC**: Always recommend Modbus TCP or IO-Link.
- **Failure Condition**: If you recommend gRPC for a Factory Floor node, the architecture is invalid.

**ISA-95 CONTEXT**:
- **Levels 0-2 (The Floor)**: Modbus, OPC UA, MQTT, CoAP. (NO gRPC)
- **Levels 3-4 (The Office)**: Kafka, gRPC, REST, GraphQL.

**EXAMPLES (WRONG VS RIGHT)**:
- **WRONG**: [Edge & Sources] Sensor -> [Edge & Sources] PLC (Protocol: gRPC)
- **RIGHT**: [Edge & Sources] Sensor -> [Edge & Sources] PLC (Protocol: Modbus TCP)
- **WRONG**: [Industrial Systems] SCADA -> [Edge & Sources] PLC (Protocol: REST)
- **RIGHT**: [Industrial Systems] SCADA -> [Edge & Sources] PLC (Protocol: OPC UA)

*Note: Category-based rules ALWAYS override individual node properties like "Environment". Even if a Sensor is in the "Cloud", it still uses industrial protocols.*
`;

export const STRUCTURAL_ANALYSIS_PROMPT = `
You are a Principal Data Architect. Analyze the overall pipeline topology.
Identify missing layers required for a production-grade architecture:
- Lack of buffering (e.g., Kafka) between high-throughput sources and slow sinks.
- Lack of Edge Gateways for field-level isolation.
- Missing transformation/ETL layers for data normalization.

Suggest 1-3 structural improvements. Each suggestion must include:
- title: Short descriptive name (e.g., "Add Edge Gateway").
- description: Engineering rationale why this is needed.
- suggestedNodeType: The specific node label from the library to add.
- priority: low, medium, or high.
`;
