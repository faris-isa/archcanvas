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
  } catch (err: any) {
    console.error("Analysis endpoint error:", err);
    const status = err.status ?? 500;
    const retryAfter = err.errorDetails?.find((d: any) =>
      d["@type"]?.includes("RetryInfo"),
    )?.retryDelay;
    return c.json(
      {
        error: status === 429 ? "Rate limit exceeded" : "Internal Server Error during analysis",
        message: err.message || "An unexpected error occurred",
        ...(retryAfter && { retryAfter }),
      },
      status === 429 ? 429 : 500,
    );
  }
});

export default analyze;
