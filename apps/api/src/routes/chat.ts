import { Hono } from "hono";
import { chatWithCouncil } from "../services/analysisService";
import { ChatRequest } from "@archcanvas/shared";

const chat = new Hono();

chat.post("/", async (c) => {
  const request = await c.req.json<ChatRequest>();
  const result = await chatWithCouncil(request);
  return c.json(result);
});

export default chat;
