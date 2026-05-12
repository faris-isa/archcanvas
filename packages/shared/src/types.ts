export type IntentProperty = 'throughput-rate' | 'environment' | 'latency-tolerance' | 'network-reliability';

export type IntentValues = {
  'throughput-rate': 'high' | 'medium' | 'low';
  'environment': 'edge' | 'cloud';
  'latency-tolerance': 'low' | 'medium' | 'high';
  'network-reliability': 'stable' | 'unstable' | 'volatile';
};

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
};

export type AnalyzeResponse = {
  edges: {
    edgeId: string;
    recommendedProtocol: string;
    engineeringExplanation: string;
  }[];
};

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
