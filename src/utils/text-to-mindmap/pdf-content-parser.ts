/**
 * PDF内容解析器 - 专门处理从PDF提取的文本内容
 */

import { MindElixirData } from './index';
import { parseUniversalPdfContent } from './universal-pdf-parser';

/**
 * 解析PDF内容为思维导图 - 使用通用解析器
 */
export function parsePdfContent(input: string): MindElixirData {
  console.log('🔍 使用PDF内容解析器（通用版本）');
  return parseUniversalPdfContent(input);
}

