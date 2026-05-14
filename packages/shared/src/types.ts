export interface ArchNodeData {
  [key: string]: unknown;
  label: string;
  category: string;
  intentProperties: Record<string, unknown>;
  isFolded?: boolean;
  templateId?: string;
}

export interface CustomNodeAttribute {
  name: string;
  label: string;
  description?: string;
  type: "text" | "number" | "select" | "boolean";
  options?: string[];
  default: any;
}

export interface CustomNodeTemplate {
  id: string;
  name: string;
  category: string;
  attributes: CustomNodeAttribute[];
}

export interface AnalyzeRequest {
  nodes: any[];
  edges: any[];
  model?: string;
}

export interface AnalyzeResponse {
  edges: {
    edgeId: string;
    recommendedProtocol: string;
    engineeringExplanation: string;
  }[];
  suggestions?: {
    title: string;
    description: string;
    suggestedNodeType?: string;
    priority: "low" | "medium" | "high";
  }[];
  grouping?: {
    nodeId: string;
    groupLabel: string;
  }[];
}

export type PipelineSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type PipelineDetail = {
  id: string;
  name: string;
  canvasState: any;
  createdAt: string;
  updatedAt: string;
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  canvasState: {
    nodes: any[];
    edges: any[];
  };
  model?: string;
}

export interface ChatResponse {
  content: string;
  suggestedNodes?: any[];
  suggestedEdges?: any[];
}
