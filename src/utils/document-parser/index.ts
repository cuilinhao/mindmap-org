// 仅在服务器端使用的依赖
let mammoth: { extractRawText: (options: { buffer: Buffer }) => Promise<{ value: string; messages: unknown[] }> } | null = null;

// 延迟加载依赖 - 仅加载mammoth
async function loadDependencies() {
  console.log('Loading dependencies...');
  console.log('Environment check - typeof window:', typeof window);
  
  // 仅在服务器端加载mammoth
  if (typeof window === 'undefined' && !mammoth) {
    try {
      mammoth = await import('mammoth');
      console.log('mammoth loaded successfully:', !!mammoth);
    } catch (error) {
      console.warn('mammoth import failed:', error);
    }
  }
}

import type { DocumentContent, DocumentParseResult } from '@/lib/types';

/**
 * 解析TXT文件
 */
export async function parseTxtFile(buffer: Buffer): Promise<DocumentContent> {
  const text = buffer.toString('utf-8');
  return parseTextContent(text);
}

/**
 * 解析PDF文件 - 仅在API路由中使用
 * 这个函数不应该在客户端代码中调用
 */
export async function parsePdfFile(buffer: Buffer): Promise<DocumentContent> {
  // 检查是否在服务器环境中
  if (typeof window !== 'undefined') {
    throw new Error('PDF解析功能只能在服务器端使用');
  }
  
  console.log('🚀 开始解析PDF文件...');
  
  try {
    // 直接使用动态导入加载pdf-parse，移除文件系统操作
    console.log('🔄 尝试加载pdf-parse...');
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    console.log('✅ pdf-parse加载成功');

    console.log('✅ 开始解析PDF文件...');
    console.log('  - Buffer大小:', buffer.length, 'bytes');
    
    // 配置选项，避免依赖文件系统
    const options = {
      // 禁用版本检查，避免需要测试文件
      version: false
    };
    
    const pdfData = await pdfParse(buffer, options);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      console.error('❌ PDF文件中没有找到可读取的文本内容');
      throw new Error('PDF文件中没有找到可读取的文本内容');
    }

    console.log('📊 PDF解析结果:');
    console.log('  - 文本长度:', text.length);
    console.log('  - 文本前500字符:', text.substring(0, 500));

    console.log('✅ PDF解析成功，开始文本内容处理...');
    return parseTextContent(text);
  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    
    // 创建自定义错误对象，包含错误代码
    const customError = new Error('PDF文件解析失败，请确保文件包含可提取的文本内容');
    (customError as any).code = 'PDF_PARSE_FAILED';
    
    throw customError;
  }
}

/**
 * 解析DOCX文件
 */
export async function parseDocxFile(buffer: Buffer): Promise<DocumentContent> {
  await loadDependencies();

  if (!mammoth) {
    throw new Error('DOCX解析功能暂时不可用，请使用文本输入或其他格式');
  }

  try {
    console.log('🚀 开始使用mammoth解析DOCX文件...');
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    console.log('📊 DOCX解析结果:');
    console.log('  - 文本长度:', text.length);
    console.log('  - 文本前200字符:', text.substring(0, 200));
    console.log('  - 警告数量:', result.messages?.length || 0);

    if (!text || text.trim().length === 0) {
      throw new Error('DOCX文件中没有找到可读取的文本内容');
    }

    // 检查是否有警告信息
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    console.log('✅ DOCX解析成功，开始文本内容处理...');
    return parseTextContent(text);
  } catch (error) {
    console.error('❌ DOCX parsing error:', error);
    throw new Error('DOCX文件解析失败，请确保文件格式正确');
  }
}

/**
 * 解析DOC文件
 * 注意：mammoth库主要支持DOCX格式，对传统DOC格式支持有限
 */
export async function parseDocFile(buffer: Buffer): Promise<DocumentContent> {
  console.log('🚀 开始处理DOC文件...');
  console.log('⚠️ 注意：DOC是较老的二进制格式，解析支持有限');

  try {
    await loadDependencies();

    if (!mammoth) {
      throw new Error('文档解析功能暂时不可用，请使用文本输入或其他格式');
    }

    // 尝试使用mammoth解析（虽然主要支持DOCX）
    console.log('🔄 尝试使用mammoth解析DOC文件...');
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    console.log('📊 DOC解析结果:');
    console.log('  - 文本长度:', text.length);
    console.log('  - 文本前200字符:', text.substring(0, 200));
    console.log('  - 警告数量:', result.messages?.length || 0);

    if (!text || text.trim().length === 0) {
      throw new Error('DOC文件中没有找到可读取的文本内容');
    }

    // 检查是否有警告信息
    if (result.messages && result.messages.length > 0) {
      console.warn('DOC parsing warnings:', result.messages);
    }

    console.log('✅ DOC解析成功，开始文本内容处理...');
    return parseTextContent(text);

  } catch (error) {
    console.error('❌ DOC parsing error:', error);

    // 检查是否是格式不支持的错误
    if (error.message?.includes('docx file') ||
        error.message?.includes('body element') ||
        error.message?.includes('not supported')) {

      console.log('💡 DOC格式不受支持，提供用户友好的错误信息');
      // 使用错误代码，前端会根据当前语言显示相应的错误信息
      const error = new Error('DOC_NOT_SUPPORTED');
      (error as any).code = 'DOC_NOT_SUPPORTED';
      throw error;

    } else {
      // 其他类型的错误
      throw new Error('DOC文件解析失败：' + error.message);
    }
  }
}

/**
 * 解析文本内容（统一处理）
 */
export function parseTextContent(text: string): DocumentContent {
  // 清理和标准化文本
  const cleanedText = cleanText(text);

  // 分割段落
  const paragraphs = splitIntoParagraphs(cleanedText);

  // 提取标题
  const extractedTitle = extractTitle(cleanedText);

  // 检测语言
  const language = detectLanguage(cleanedText);

  return {
    originalText: cleanedText,
    paragraphs,
    metadata: {
      totalLength: cleanedText.length,
      paragraphCount: paragraphs.length,
      language,
      extractedTitle
    }
  };
}

/**
 * 清理文本内容
 */
function cleanText(text: string): string {
  return text
    // 统一换行符
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // 移除多余的空格和制表符
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    // 规范化段落分隔
    .replace(/\n{3,}/g, '\n\n')
    // 移除行首行尾空格
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // 移除首尾空白
    .trim();
}

/**
 * 将文本分割为段落
 */
function splitIntoParagraphs(text: string): string[] {
  const minParagraphLength = 2; // 降低最小段落长度，保留更多有意义的短内容

  // 首先按双换行符分割
  let paragraphs = text.split(/\n\s*\n/);

  // 过滤掉太短的段落，但保留一些重要的短段落
  paragraphs = paragraphs.filter(paragraph => {
    const trimmed = paragraph.trim();
    
    // 保留长度足够的段落
    if (trimmed.length >= minParagraphLength) {
      return true;
    }
    
    return false;
  });

  // 如果段落数量太少，尝试按单换行符重新分割
  if (paragraphs.length < 5) {
    const altParagraphs = text.split(/\n/)
      .map(p => p.trim())
      .filter(p => p.length >= minParagraphLength);
    
    if (altParagraphs.length > paragraphs.length) {
      paragraphs = altParagraphs;
    }
  }

  // 如果仍然没有段落，直接使用整个文本作为一个段落（支持超短文本）
  if (paragraphs.length === 0 && text.trim().length > 0) {
    paragraphs = [text.trim()];
  }

  // 清理每个段落
  return paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0)
    // 移除重复的段落
    .filter((paragraph, index, array) =>
      array.findIndex(p => p === paragraph) === index
    );
}

/**
 * 判断文本是否像标题
 */
function isLikelyTitle(text: string): boolean {
  // 标题特征：
  // 1. 长度适中（10-100字符）
  // 2. 没有句号结尾
  // 3. 可能包含数字编号
  // 4. 首字母大写或全大写

  if (text.length < 5 || text.length > 100) {
    return false;
  }

  // 不以句号结尾
  if (text.endsWith('.') || text.endsWith('。')) {
    return false;
  }

  // 包含数字编号模式
  if (/^\d+[\.\)]\s*/.test(text) || /^第[一二三四五六七八九十\d]+[章节条款]/.test(text)) {
    return true;
  }

  // 检查是否为全大写或标题大小写
  const words = text.split(' ');
  const capitalizedWords = words.filter(word =>
    word.length > 0 && word[0] === word[0].toUpperCase()
  );

  return capitalizedWords.length / words.length > 0.5;
}

/**
 * 从文本中提取标题
 */
function extractTitle(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return '未命名文档';
  }

  // 取第一行作为潜在标题
  const firstLine = lines[0];

  // 如果第一行看起来像标题，使用它
  if (isLikelyTitle(firstLine) && firstLine.length <= 100) {
    return firstLine;
  }

  // 查找前几行中最像标题的
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i];
    if (isLikelyTitle(line) && line.length <= 100) {
      return line;
    }
  }

  // 如果没有找到合适的标题，返回第一行的前50个字符
  return firstLine.slice(0, 50) + (firstLine.length > 50 ? '...' : '');
}

/**
 * 检测文本语言
 */
function detectLanguage(text: string): 'zh' | 'en' | 'auto' {
  const chineseCharCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalCharCount = text.length;
  const chineseRatio = chineseCharCount / totalCharCount;

  if (chineseRatio > 0.3) {
    return 'zh';
  }

  if (/^[a-zA-Z\s\.,!?;:\-'"()0-9]+$/.test(text.slice(0, 200))) {
    return 'en';
  }

  return 'auto';
}

/**
 * 根据文件类型解析文档
 */
export async function parseDocumentByType(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<DocumentParseResult> {
  const startTime = Date.now();

  try {
    let documentContent: DocumentContent;

    switch (mimeType) {
      case 'text/plain':
        documentContent = await parseTxtFile(buffer);
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        documentContent = await parseDocxFile(buffer);
        break;

      case 'application/msword':
        documentContent = await parseDocFile(buffer);
        break;

      default:
        // 尝试按文本处理
        try {
          const text = buffer.toString('utf-8');
          if (text && text.trim().length > 0) {
            documentContent = parseTextContent(text);
          } else {
            throw new Error(`不支持的文件类型: ${mimeType}`);
          }
        } catch (error) {
          throw new Error(`不支持的文件类型: ${mimeType}`);
        }
    }

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      content: documentContent,
      processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Document parsing error:', error);

    // 提取错误代码（如果有）
    const errorCode = (error as any)?.code || 'DOCUMENT_PARSE_FAILED';
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '文档解析失败',
      errorCode,
      processingTime
    };
  }
}

/**
 * 验证文件是否可以解析
 */
export function validateFileForParsing(file: File): { valid: boolean; error?: string } {
  // 检查文件大小 (10MB限制)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '文件大小不能超过10MB'
    };
  }

  // 检查文件类型
  const supportedTypes = [
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.ms-powerpoint' // PPT
  ];

  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的文件类型，请上传TXT、DOCX、PPT文件'
    };
  }

  return { valid: true };
}
