process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.GCLOUD_PROJECT = "demo-archcanvas";

import { expect, test, describe, beforeAll } from "vitest";
import { pipelineService } from "../src/firebase/pipelineService";

describe("Pipeline Service (Firestore)", () => {
  let testId: string;

  test("createPipeline should insert a new pipeline", async () => {
    const name = "Test Pipeline";
    const canvasState = { nodes: [], edges: [] };
    testId = await pipelineService.createPipeline(name, canvasState);
    expect(testId).toBeDefined();
    expect(typeof testId).toBe("string");
  });

  test("listPipelines should return all pipelines", async () => {
    const list = await pipelineService.listPipelines();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some(p => p.id === testId)).toBe(true);
  });

  test("getPipeline should return the correct pipeline", async () => {
    const pipeline = await pipelineService.getPipeline(testId);
    expect(pipeline).toBeDefined();
    expect(pipeline?.id).toBe(testId);
    expect(pipeline?.name).toBe("Test Pipeline");
  });

  test("updatePipeline should update pipeline data", async () => {
    await pipelineService.updatePipeline(testId, "Updated Name");
    const updated = await pipelineService.getPipeline(testId);
    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Updated Name");
  });

  test("deletePipeline should remove the pipeline", async () => {
    await pipelineService.deletePipeline(testId);
    const pipeline = await pipelineService.getPipeline(testId);
    expect(pipeline).toBeNull();
  });
});
