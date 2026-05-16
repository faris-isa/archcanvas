import { AnalyzeRequest, AnalyzeResponse } from "@archcanvas/shared";
import { getModel, resolveDynamicModels, extractText } from "./core";
import { ARCHITECT_PROMPT, DATA_ENGINEER_PROMPT, SECURITY_PROMPT, SRE_PROMPT } from "./prompts";

export const analyzeWithGemini = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const uniqueModels = await resolveDynamicModels(request.model);
  let lastError: any = null;

  for (const modelName of uniqueModels) {
    try {
      const model = getModel(modelName, true);
      console.log(`Performing Quad-Persona Analysis with model: ${modelName}`);

      const context = `\n\nCANVAS STATE:\nNodes: ${JSON.stringify(request.nodes)}\nEdges: ${JSON.stringify(request.edges)}`;

      const tasks = [
        {
          prompt:
            ARCHITECT_PROMPT +
            context +
            `\n\nReturn JSON exactly in this format: { "edges": [{ "edgeId": "...", "recommendedProtocol": "...", "engineeringExplanation": "..." }] }`,
        },
        {
          prompt:
            DATA_ENGINEER_PROMPT +
            context +
            `\n\nCRITICAL: You MUST assign EVERY node (using the exact node "id" field from CANVAS STATE) into one of these 5 architectural layers:\n1. "Edge Acquisition Layer" — sensors, PLCs, gateways, OPC-UA, SCADA, HMI, edge devices\n2. "Transport Layer" — Kafka, RabbitMQ, NATS, Pub/Sub, network segments, VPN, WAN links\n3. "Medallion Transformation Engine" — processors, Spark, Flink, Bronze/Silver layers, Quality Gates, Schema Registry\n4. "Gold Storage Layer" — databases, data lakes, InfluxDB, ClickHouse, Snowflake, storage sinks\n5. "Observability & Quality Gate Sinks" — Grafana, dashboards, alerts, webhooks, visualization portals\n\nReturn JSON exactly in this format (grouping must contain ALL node IDs): { "grouping": [{ "nodeId": "<exact node id>", "groupLabel": "<one of the 5 layers above>" }], "recommendations": [{ "title": "...", "description": "...", "priority": "medium" }] }`,
        },
        {
          prompt:
            SECURITY_PROMPT +
            context +
            `\n\nReturn JSON exactly in this format: { "recommendations": [{ "title": "...", "description": "...", "priority": "high" }] }`,
        },
        {
          prompt:
            SRE_PROMPT +
            context +
            `\n\nReturn JSON exactly in this format: { "recommendations": [{ "title": "...", "description": "...", "priority": "high" }] }`,
        },
      ];

      const results = await Promise.all(tasks.map((t) => model.generateContent(t.prompt)));

      const parsedData = results.map((r) => {
        const text = extractText(r.response)
          .replace(/```json\n?|\n?```/g, "")
          .trim();
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse persona response", e);
          return {};
        }
      });

      return {
        edges: parsedData[0].edges || [],
        grouping: parsedData[1].grouping || [],
        suggestions: [
          ...(parsedData[1].recommendations || []),
          ...(parsedData[2].recommendations || []),
          ...(parsedData[3].recommendations || []),
        ].sort((a, b) => {
          const priorityMap = { high: 0, medium: 1, low: 2 };
          return (
            priorityMap[a.priority as keyof typeof priorityMap] -
            priorityMap[b.priority as keyof typeof priorityMap]
          );
        }),
      };
    } catch (err: any) {
      if (
        err.status === 429 ||
        err.status >= 500 ||
        err.name === "TypeError" ||
        err.message?.includes("fetch failed")
      ) {
        console.warn(
          `Model ${modelName} failed with status ${err.status || "network error"} (e.g. Quota Exceeded/Fetch Failed). Falling back... Error: ${err.message || err}`,
        );
        lastError = err;
        continue;
      }
      console.error(`Model ${modelName} failed with non-recoverable error. Aborting.`);
      throw err;
    }
  }

  throw new Error(
    `Gemini Quad-Persona Analysis Failed on all models. Last Error: ${lastError?.message || lastError}`,
  );
};
