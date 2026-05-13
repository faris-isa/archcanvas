import { Hono } from "hono";

const diagnostic = new Hono();

diagnostic.get("/gemini", async (c) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return c.json(
      {
        error: "GEMINI_API_KEY not found in environment",
        status: "error",
      },
      400,
    );
  }

  try {
    // We use a raw fetch to the models endpoint because genAI.listModels()
    // sometimes masks the raw error details we need.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return c.json(
        {
          status: "api_error",
          httpStatus: response.status,
          error: data,
        },
        response.status,
      );
    }

    return c.json({
      status: "success",
      models: data.models,
      note: "These are the models your API key can currently see.",
    });
  } catch (err: any) {
    return c.json(
      {
        status: "crash",
        error: err.message,
      },
      500,
    );
  }
});

export default diagnostic;
