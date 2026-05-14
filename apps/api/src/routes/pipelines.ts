import { Hono } from "hono";
import { pipelineService } from "../firebase/pipelineService";

const pipelines = new Hono();

pipelines.get("/", async (c) => {
  const summaries = await pipelineService.listPipelines();
  return c.json(summaries);
});

pipelines.get("/:id", async (c) => {
  const id = c.req.param("id");
  const p = await pipelineService.getPipeline(id);
  if (!p) return c.json({ error: "Not Found" }, 404);
  return c.json(p);
});

pipelines.post("/", async (c) => {
  const body = await c.req.json();
  const id = await pipelineService.createPipeline(
    body.name || "Untitled Pipeline",
    body.canvasState || { nodes: [], edges: [] },
  );
  const newP = await pipelineService.getPipeline(id);
  return c.json(newP, 201);
});

pipelines.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  await pipelineService.updatePipeline(id, body.name, body.canvasState);
  const updated = await pipelineService.getPipeline(id);
  return c.json(updated);
});

pipelines.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await pipelineService.deletePipeline(id);
  return c.json({ success: true }, 200);
});

export default pipelines;
