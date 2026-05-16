import { ChatRequest, ChatResponse } from "@archcanvas/shared";
import { getModel, resolveDynamicModels, extractText } from "./core";

export const chatWithGemini = async (request: ChatRequest): Promise<ChatResponse> => {
  const uniqueModels = await resolveDynamicModels(request.model);
  let lastError: any = null;

  for (const modelName of uniqueModels) {
    try {
      const model = getModel(modelName);
      console.log(`Starting Chat Session with model: ${modelName}`);

      const systemContext = `
        You are the "Industrial Engineering Council" (Architect, Data Engineer, Security, and SRE).
        The user is designing an industrial data pipeline.
        
        CURRENT CANVAS STATE:
        Nodes: ${JSON.stringify(request.canvasState.nodes)}
        Edges: ${JSON.stringify(request.canvasState.edges)}
        
        GUIDELINES:
        - Answer as a unified council.
        - Be technical and engineering-focused.
        - Reference specific nodes in the canvas by their labels.
        - If asked to advice on a NEW architecture or MAJOR change, you can suggest a canvas update.
        
        CANVAS UPDATES:
        If you want to suggest architectural changes (new nodes, moved nodes, regrouping, or protocol annotations), append a JSON block at the END of your message wrapped in <canvas_update> tags.
        CRITICAL: Every node MUST include a "category" string and an "intentProperties" object. If you omit these, the frontend will crash.

        GROUPING: Use the "grouping" array to assign nodes to architectural layers. Valid layer names are:
          - "Edge Acquisition Layer"
          - "Transport Layer"
          - "Medallion Transformation Engine"
          - "Gold Storage Layer"
          - "Observability & Quality Gate Sinks"
        ALWAYS include a grouping entry for every node you mention (existing or new).

        EDGE PROTOCOLS: Use the "edgeProtocols" array to annotate connections with the correct wire protocol.
        Reference the edge by its existing id, or use the source→target node ids to identify it.
        Example protocols: "Kafka Wire Protocol", "OPC UA Binary", "MQTT", "gRPC", "REST/HTTP", "JDBC/Native TCP", "CQL/Native TCP", "RESP (Redis Protocol)"

        Format:
        <canvas_update>
        {
          "nodes": [
            { 
              "id": "node-1", 
              "type": "intentNode", 
              "data": { 
                "label": "Apache Flink", 
                "category": "Processing", 
                "intentProperties": { "environment": "cloud", "job": "Stream processing" } 
              }, 
              "position": { "x": 0, "y": 0 } 
            }
          ],
          "edges": [
            { "id": "edge-1", "source": "node-1", "target": "node-2" }
          ],
          "grouping": [
            { "nodeId": "node-1", "groupLabel": "Medallion Transformation Engine" }
          ],
          "edgeProtocols": [
            { "edgeId": "edge-1", "recommendedProtocol": "Kafka Wire Protocol", "engineeringExplanation": "Flink consumes from Kafka topics" }
          ]
        }
        </canvas_update>
      `;

      // Gemini history MUST start with 'user'. Filter out initial assistant greetings.
      const history = request.messages.slice(0, -1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const firstUserIndex = history.findIndex((h) => h.role === "user");
      const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];

      const chat = model.startChat({
        history: validHistory,
        systemInstruction: { role: "system", parts: [{ text: systemContext }] } as any,
      });

      const lastMsg = request.messages[request.messages.length - 1];
      const result = await chat.sendMessage(lastMsg.content);
      const response = await result.response;
      const fullText = extractText(response);

      // Guard against empty/blocked responses (safety filter, finishReason: OTHER, etc.)
      if (!fullText.trim()) {
        const finishReason = response.candidates?.[0]?.finishReason;
        console.warn(
          `Model ${modelName} returned empty content (finishReason: ${finishReason}). Falling back...`,
        );
        lastError = new Error(`Model ${modelName} returned empty response`);
        continue;
      }

      // Extract canvas update if present
      let suggestedNodes = undefined;
      let suggestedEdges = undefined;
      let suggestedGrouping: { nodeId: string; groupLabel: string }[] | undefined = undefined;
      let suggestedEdgeProtocols:
        | { edgeId: string; recommendedProtocol: string; engineeringExplanation: string }[]
        | undefined = undefined;

      const updateMatch = fullText.match(/<canvas_update>([\s\S]*?)<\/canvas_update>/);
      let cleanedText = fullText;

      if (updateMatch) {
        try {
          const updateData = JSON.parse(updateMatch[1].trim());
          suggestedNodes = updateData.nodes;
          suggestedEdges = updateData.edges;
          suggestedGrouping = updateData.grouping;
          suggestedEdgeProtocols = updateData.edgeProtocols;
          cleanedText = fullText.replace(/<canvas_update>[\s\S]*?<\/canvas_update>/, "").trim();
        } catch (e) {
          console.error("Failed to parse suggested canvas update", e);
        }
      }

      return {
        content: cleanedText,
        suggestedNodes,
        suggestedEdges,
        suggestedGrouping,
        suggestedEdgeProtocols,
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
    `Gemini Chat Failed on all models. Last Error: ${lastError?.message || lastError}`,
  );
};
