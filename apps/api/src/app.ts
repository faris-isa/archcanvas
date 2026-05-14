import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import health from "./routes/health";
import pipelines from "./routes/pipelines";
import analyze from "./routes/analyze";
import diagnostic from "./routes/diagnostic";
import chat from "./routes/chat";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Routes
app.route("/api/health", health);
app.route("/api/pipelines", pipelines);
app.route("/api/analyze-architecture", analyze);
app.route("/api/chat", chat);
app.route("/api/diagnostic", diagnostic);

// Error handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json(
    {
      error: err.message || "Internal Server Error",
      status: 500,
    },
    500,
  );
});

app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      status: 404,
    },
    404,
  );
});

export default app;
