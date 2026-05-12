import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { createPipeline, getPipelines, getPipelineById, updatePipeline, deletePipeline } from "../src/db/queries";
import { db } from "../src/db/connection";
import { pipelines } from "../src/db/schema";

describe("Pipeline DB Queries", () => {
  const testId = "test-pipeline-1";

  beforeAll(async () => {
    // Clean up or setup if needed
    // Drizzle with better-sqlite3 uses a file, we might want to use memory for tests
    // but for now let's just use the file and clean up
    try {
      await deletePipeline(testId);
    } catch (e) {}
  });

  test("createPipeline should insert a new pipeline", async () => {
    const newPipeline = {
      id: testId,
      name: "Test Pipeline",
      canvasState: JSON.stringify({ nodes: [], edges: [] }),
    };
    const result = await createPipeline(newPipeline);
    expect(result).toBeDefined();
    expect(result.id).toBe(testId);
    expect(result.name).toBe("Test Pipeline");
  });

  test("getPipelines should return all pipelines", async () => {
    const list = await getPipelines();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some(p => p.id === testId)).toBe(true);
  });

  test("getPipelineById should return the correct pipeline", async () => {
    const pipeline = await getPipelineById(testId);
    expect(pipeline).toBeDefined();
    expect(pipeline?.id).toBe(testId);
  });

  test("updatePipeline should update pipeline data", async () => {
    const updated = await updatePipeline(testId, { name: "Updated Name" });
    expect(updated).toBeDefined();
    expect(updated.name).toBe("Updated Name");
  });

  test("deletePipeline should remove the pipeline", async () => {
    const deleted = await deletePipeline(testId);
    expect(deleted).toBeDefined();
    expect(deleted.id).toBe(testId);
    
    const pipeline = await getPipelineById(testId);
    expect(pipeline).toBeUndefined();
  });
});
