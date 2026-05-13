import { Hono } from "hono";
import { analyzeArchitecture } from "../services/analysisService";
import { AnalyzeRequest } from "@archcanvas/shared";

const analyze = new Hono();

analyze.post("/", async (c) => {
  try {
    const body = (await c.req.json()) as AnalyzeRequest;

    if (!body.nodes || !body.edges) {
      return c.json({ error: "Invalid request body: missing nodes or edges" }, 400);
    }

    const result = await analyzeArchitecture(body);
    return c.json(result);
  } catch (error) {
    console.error("Analysis endpoint error:", error);
    return c.json({ error: "Internal Server Error during analysis" }, 500);
  }
});

export default analyze;
