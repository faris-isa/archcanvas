export type IntentProperty = string;

export type IntentValues = Record<string, string>;

export type ArchNodeData = {
  label: string;
  category: string;
  intentProperties: IntentValues;
};

export type AnalyzeRequest = {
  nodes: ArchNodeData[];
  edges: {
    id: string;
    source: string;
    target: string;
    sourceData: ArchNodeData;
    targetData: ArchNodeData;
  }[];
  model?: string;
};

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
  canvasState: any; // Native JSON object from Firestore
  createdAt: string;
  updatedAt: string;
};
