import { expect, test, describe } from "bun:test";
import app from "../src/app";

describe("Health Check", () => {
  test("GET /api/health returns 200 and ok status", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      status: "ok",
      timestamp: expect.any(String),
    });
  });

  test("Non-existent route returns 404 with structured error", async () => {
    const res = await app.request("/api/nonexistent");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});
