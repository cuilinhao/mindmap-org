/**
 * API响应验证工具
 * 确保所有API响应都是有效的JSON格式
 */

import type { ApiResponse } from '@/lib/types';

/**
 * 验证API响应是否为有效的JSON格式
 */
export function validateApiResponse(response: any): boolean {
  try {
    // 检查基本结构
    if (!response || typeof response !== 'object') {
      return false;
    }

    // 检查必要字段
    if (typeof response.success !== 'boolean') {
      return false;
    }

    // 如果是错误响应，检查错误字段
    if (!response.success) {
      if (!response.error || typeof response.error !== 'object') {
        return false;
      }
      if (typeof response.error.message !== 'string') {
        return false;
      }
    }

    // 如果是成功响应，检查数据字段
    if (response.success && response.data) {
      // 数据字段可以是任何类型，但必须可序列化
      try {
        JSON.stringify(response.data);
      } catch {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating API response:', error);
    return false;
  }
}

/**
 * 创建标准的成功响应
 */
export function createSuccessResponse<T>(data: T, metadata?: any): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };
}

/**
 * 创建标准的错误响应
 */
export function createErrorResponse(
  message: string, 
  code: string = 'UNKNOWN_ERROR',
  details?: Record<string, unknown>
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * 安全的JSON序列化
 */
export function safeJsonStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('JSON stringify error:', error);
    // 返回一个安全的错误响应
    return JSON.stringify(createErrorResponse(
      '数据序列化失败',
      'JSON_STRINGIFY_ERROR'
    ));
  }
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T = any>(jsonStr: string): { success: boolean; data?: T; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'JSON解析失败' 
    };
  }
}

/**
 * 检查响应是否为HTML错误页面
 */
export function isHtmlErrorPage(text: string): boolean {
  const htmlIndicators = [
    '<!DOCTYPE html',
    '<html',
    'Request Entity Too Large',
    'Gateway Timeout',
    'Internal Server Error',
    'Bad Gateway'
  ];
  
  const lowerText = text.toLowerCase();
  return htmlIndicators.some(indicator => 
    lowerText.includes(indicator.toLowerCase())
  );
}

/**
 * 从错误文本中提取错误信息
 */
export function extractErrorFromHtml(htmlText: string): { message: string; code: string } {
  const text = htmlText.toLowerCase();
  
  if (text.includes('request entity too large')) {
    return {
      message: '请求体过大，请选择小于9MB的文件',
      code: 'REQUEST_TOO_LARGE'
    };
  }
  
  if (text.includes('gateway timeout')) {
    return {
      message: '请求超时，请稍后重试',
      code: 'GATEWAY_TIMEOUT'
    };
  }
  
  if (text.includes('internal server error')) {
    return {
      message: '服务器内部错误',
      code: 'INTERNAL_SERVER_ERROR'
    };
  }
  
  if (text.includes('bad gateway')) {
    return {
      message: '网关错误，请稍后重试',
      code: 'BAD_GATEWAY'
    };
  }
  
  return {
    message: '未知服务器错误',
    code: 'UNKNOWN_SERVER_ERROR'
  };
}
