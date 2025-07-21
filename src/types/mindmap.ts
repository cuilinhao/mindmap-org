// MindElixir 思维导图数据类型
export interface MindElixirNode {
  id: string;
  topic: string;
  root?: boolean;
  children?: MindElixirNode[];
  style?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    borderColor?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface MindElixirData {
  nodeData: MindElixirNode;
  linkData?: Record<string, unknown>;
}

// ReactFlow 思维导图数据类型
export interface ReactFlowNodeData {
  content: string;
  type: 'root' | 'topic' | 'paragraph';
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
  };
  summary?: string;
  fullText?: string;
}

export interface ReactFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: ReactFlowNodeData;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  style?: {
    strokeWidth?: number;
    stroke?: string;
  };
}

export interface ReactFlowMindMapData {
  title: string;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  metadata: {
    created_at: string;
    version: string;
    statistics: {
      nodeCount: number;
      topicCount: number;
      paragraphCount: number;
    };
  };
}