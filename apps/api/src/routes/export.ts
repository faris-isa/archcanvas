import { Hono } from "hono";
import { exportArchitectureReport } from "../services/gemini";
import { AnalyzeRequest } from "@archcanvas/shared";
import { mockAnalyzeArchitecture } from "../services/mockAnalysisService";

const exportRoute = new Hono();

exportRoute.post("/", async (c) => {
  try {
    const body = (await c.req.json()) as AnalyzeRequest;

    if (!body.nodes || !body.edges) {
      return c.json({ error: "Invalid request body: missing nodes or edges" }, 400);
    }

    if (!process.env.GEMINI_API_KEY) {
      return c.html(
        "<!DOCTYPE html><html><head><title>Mock Export</title></head><body style='background: #1e1e1e; color: #fff; padding: 2rem; font-family: sans-serif;'><h1>Mock Mode Active</h1><p>Set GEMINI_API_KEY to generate a real HTML report.</p></body></html>",
      );
    }

    const htmlReport = await exportArchitectureReport(body);
    return c.html(htmlReport);
  } catch (err: any) {
    console.error("Export endpoint error:", err);
    return c.html(
      `<!DOCTYPE html><html><head><title>Error</title></head><body style='background: #1e1e1e; color: #ff5555; padding: 2rem; font-family: sans-serif;'><h1>Error Generating Report</h1><p>${err.message}</p></body></html>`,
      500,
    );
  }
});

export default exportRoute;
