// =============================================
// 思维导图相关类型定义
// =============================================

export interface MindMapNode {
  id: string;
  type: 'root' | 'topic' | 'subtopic' | 'paragraph';
  content: string;
  summary?: string;
  fullText?: string;
  parent?: string;
  position: {
    x: number;
    y: number;
  };
  children?: string[];
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
  };
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type?: 'smoothstep' | 'straight' | 'step';
  animated?: boolean;
  style?: {
    strokeWidth?: number;
    stroke?: string;
  };
}

export interface MindMapData {
  id?: string;
  title: string;
  root: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  metadata?: {
    created_at?: string;
    updated_at?: string;
    version?: string;
    statistics?: {
      nodeCount: number;
      topicCount: number;
      paragraphCount: number;
    };
  };
}

// =============================================
// 数据库相关类型定义
// =============================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  profile?: {
    name?: string;
    avatar_url?: string;
  };
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    credits_remaining: number;
    credits_total: number;
    expires_at?: string;
  };
}

export interface MindMap {
  id: string;
  owner_id: string;
  title: string;
  map_json: MindMapData;
  status: 'processing' | 'ready' | 'failed' | 'archived';
  created_at: string;
  updated_at?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  shared?: boolean;
  share_token?: string;
}

export interface VectorRecord {
  id: string;
  map_id: string;
  paragraph_id: number;
  embedding: number[];
  content: string;
  metadata?: {
    cluster_id?: number;
    topic_title?: string;
    similarity_score?: number;
  };
}

// =============================================
// AI处理相关类型定义
// =============================================

export interface DocumentContent {
  originalText: string;
  paragraphs: string[];
  metadata: {
    totalLength: number;
    paragraphCount: number;
    language?: string;
    extractedTitle?: string;
  };
}

export interface EmbeddingResult {
  text: string;
  vector: number[];
  tokens: number;
  paragraphIndex: number;
}

export interface ClusterGroup {
  clusterId: number;
  paragraphs: string[];
  centerEmbedding: number[];
  paragraphIndices: number[];
  size: number;
}

export interface TopicSummary {
  clusterId: number;
  title: string;
  summary: string;
  paragraphs: string[];
  childCount: number;
  confidence?: number;
}

// =============================================
// 文件处理相关类型定义
// =============================================

export interface FileUploadResult {
  success: boolean;
  publicUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
}

export interface DocumentParseResult {
  success: boolean;
  content?: DocumentContent;
  error?: string;
  errorCode?: string;
  processingTime?: number;
}

// =============================================
// API响应类型定义
// =============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    processingTime?: number;
  };
}

export interface MindMapGenerationRequest {
  type: 'file_upload' | 'text_input';
  content?: string;  // 直接文本输入
  fileUrl?: string;  // 文件URL
  title?: string;
  options?: {
    maxClusters?: number;
    minParagraphLength?: number;
    language?: 'auto' | 'zh' | 'en' | 'ja' | 'ko';
    style?: 'default' | 'academic' | 'business' | 'creative';
  };
}

export type MindMapGenerationResponse = ApiResponse<{
  mindMapId: string;
  status: 'processing' | 'completed';
  estimatedTime?: number;
}>;

// =============================================
// UI组件Props类型定义
// =============================================

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload: (result: FileUploadResult) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  disabled?: boolean;
}

export interface TextInputProps {
  onTextSubmit: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export interface MindMapViewerProps {
  mindMapData: MindMapData;
  editable?: boolean;
  onNodeEdit?: (nodeId: string, newContent: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  onExport?: (format: 'png' | 'svg' | 'json') => void;
}

// =============================================
// 实用类型定义
// =============================================

export type InputMode = 'file_upload' | 'text_input';

export type ProcessingStatus = 'idle' | 'uploading' | 'parsing' | 'processing' | 'generating' | 'completed' | 'error';

export type ExportFormat = 'png' | 'svg' | 'json' | 'pdf';

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  startTime?: Date;
  endTime?: Date;
}

// =============================================
// 配置类型定义
// =============================================

export interface AppConfig {
  maxFileSize: number; // in MB
  maxTextLength: number; // in characters
  supportedFileTypes: string[];
  aiConfig: {
    embeddingModel: string;
    chatModel: string;
    maxTokens: number;
    temperature: number;
  };
  features: {
    enableFileUpload: boolean;
    enableTextInput: boolean;
    enableRealTimeCollaboration: boolean;
    enableExport: boolean;
  };
}

const TypesExport = {};
export default TypesExport;
