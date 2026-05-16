import { AnalyzeRequest } from "@archcanvas/shared";
import { getModel, resolveDynamicModels, extractText } from "./core";

export const exportArchitectureReport = async (request: AnalyzeRequest): Promise<string> => {
  const uniqueModels = await resolveDynamicModels(request.model);
  let lastError: any = null;

  for (const modelName of uniqueModels) {
    try {
      const model = getModel(modelName);
      console.log(`Generating HTML Architecture Report with model: ${modelName}`);

      const prompt = `
        You are an expert Enterprise Architect. I need an HTML report of the following data pipeline architecture.
        
        CANVAS STATE:
        Nodes: ${JSON.stringify(request.nodes)}
        Edges: ${JSON.stringify(request.edges)}
        
        Please provide a professional, beautiful, and modern HTML document (with inline CSS or a simple style tag using a clean, dark-mode inspired theme) that includes:
        1. A comprehensive analysis of the Pros and Cons of this current architecture.
        2. Suggestions for improving it, including specific new nodes or missing components.
        3. Explain how these new nodes would fit into the canvas.

        IMPORTANT: Return ONLY valid HTML (starting with <!DOCTYPE html> and ending with </html>). Do not include markdown code block formatting (like \`\`\`html) around your response. Use a modern, responsive design.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let htmlContent = extractText(response);

      // Remove markdown formatting if the model accidentally included it
      htmlContent = htmlContent.replace(/^```html\s*/i, "").replace(/\s*```$/i, "");

      if (
        !htmlContent.trim().startsWith("<!DOCTYPE html>") &&
        !htmlContent.trim().startsWith("<html")
      ) {
        htmlContent = `<!DOCTYPE html><html><head><title>Architecture Report</title><style>body { font-family: sans-serif; padding: 2rem; background: #1a1a2e; color: #e2e8f0; }</style></head><body>${htmlContent}</body></html>`;
      }

      return htmlContent;
    } catch (err: any) {
      console.warn(`Model ${modelName} failed for export. Error: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error("Failed to generate export report: " + lastError?.message);
};
