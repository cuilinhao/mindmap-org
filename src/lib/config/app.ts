import type { AppConfig } from '@/lib/types';

export const appConfig: AppConfig = {
  maxFileSize: 9, // 9 MB
  maxTextLength: 50000, // 50,000 characters (~12k tokens)
  supportedFileTypes: [
    'text/plain',
    'text/markdown', // Markdown
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.ms-powerpoint' // PPT
  ],
  aiConfig: {
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'gpt-4',
    maxTokens: 4096,
    temperature: 0.3
  },
  features: {
    enableFileUpload: true,
    enableTextInput: true,
    enableRealTimeCollaboration: true,
    enableExport: true
  }
};

export const fileTypeConfig = {
  maxSize: appConfig.maxFileSize * 1024 * 1024, // Convert to bytes
  acceptedExtensions: ['.txt', '.docx', '.doc', '.pptx', '.ppt', '.md', '.markdown'],
  acceptedMimeTypes: appConfig.supportedFileTypes
};

export const textConfig = {
  maxLength: appConfig.maxTextLength,
  minLength: 1, // 改为1，只要有内容就可以生成
  placeholder: '' // 使用翻译系统中的占位符，不在这里硬编码
};

export const clusteringConfig = {
  minClusters: 2,
  maxClusters: 8,
  minParagraphLength: 30,
  maxParagraphs: 200,
  adaptiveClusteringEnabled: true
};

export const exportConfig = {
  formats: ['png', 'svg', 'json'] as const,
  pngSettings: {
    quality: 0.95,
    backgroundColor: '#ffffff',
    padding: 20
  },
  svgSettings: {
    includeStyles: true,
    responsiveEnabled: true
  }
};

// Rate limiting configuration for free users
export const rateLimitConfig = {
  free: {
    dailyMindMaps: 3,
    maxFileSize: 5, // MB
    maxTextLength: 25000 // characters
  },
  pro: {
    dailyMindMaps: 50,
    maxFileSize: 25, // MB
    maxTextLength: 100000 // characters
  },
  enterprise: {
    dailyMindMaps: -1, // unlimited
    maxFileSize: 100, // MB
    maxTextLength: 500000 // characters
  }
};

export const processingTimeouts = {
  fileUpload: 30000, // 30 seconds
  documentParsing: 60000, // 1 minute
  embedding: 120000, // 2 minutes
  clustering: 30000, // 30 seconds
  summarization: 90000, // 1.5 minutes
  total: 300000 // 5 minutes total
};

// UI Configuration
export const uiConfig = {
  mindMapDefaults: {
    nodeWidth: 200,
    nodeHeight: 60,
    spacing: {
      horizontal: 300,
      vertical: 150
    },
    colors: {
      root: '#2563eb',
      topic: '#059669',
      subtopic: '#dc2626',
      paragraph: '#7c3aed'
    }
  },
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out'
  },
  responsiveBreakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  }
};
