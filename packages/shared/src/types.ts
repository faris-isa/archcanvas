export type IntentProperty = string;

export type IntentValues = Record<string, string>;

export type ArchNodeData = {
  label: string;
  category: string;
  intentProperties: IntentValues;
  templateId?: string; // Reference to custom template if applicable
};

export type CustomAttribute = {
  name: string;
  label: string;
  type: "select" | "text";
  options?: string[];
  default: string;
  description?: string;
};

export type CustomNodeTemplate = {
  id: string;
  name: string;
  category: string;
  icon?: string;
  attributes: CustomAttribute[];
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
  canvasState: any; // Native JSON object from Firestore
  createdAt: string;
  updatedAt: string;
};
