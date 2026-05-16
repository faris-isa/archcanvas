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
        
        Please provide a professional, beautiful, and modern HTML document (with inline CSS or a simple style tag using a clean, dark-mode inspired theme, but with a @media print block so it prints well as a PDF) that includes:
        1. A "Current Architecture" section that clearly lists all existing nodes and their core properties so the user has a full record of the canvas.
        2. A comprehensive analysis of the Pros and Cons of this current architecture.
        3. "Node Suggestions & Upgrades": When suggesting modifications or new nodes, explicitly show a "Before vs. After" comparison (e.g., showing the partial architecture before the update, and how it connects after the update).

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
