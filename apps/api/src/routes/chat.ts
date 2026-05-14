import { Hono } from "hono";
import { chatWithCouncil } from "../services/analysisService";
import { ChatRequest } from "@archcanvas/shared";

const chat = new Hono();

chat.post("/", async (c) => {
  try {
    const request = await c.req.json<ChatRequest>();
    const result = await chatWithCouncil(request);
    return c.json(result);
  } catch (err: any) {
    const status = err.status ?? 500;
    const retryAfter = err.errorDetails?.find((d: any) =>
      d["@type"]?.includes("RetryInfo"),
    )?.retryDelay;
    return c.json(
      {
        error: status === 429 ? "Rate limit exceeded" : "Chat service error",
        message: err.message || "An unexpected error occurred",
        ...(retryAfter && { retryAfter }),
      },
      status === 429 ? 429 : 500,
    );
  }
});

export default chat;
