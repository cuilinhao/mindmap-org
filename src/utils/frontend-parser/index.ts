/**
 * 前端文件解析器
 * 支持在浏览器端解析PDF和PPTX文件，直接生成Mind-Elixir JSON格式
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import JSZip from 'jszip';
import { parseString } from 'xml2js';
import { smartTextParse } from '@/utils/text-to-mindmap';
import { parseMarkdownToMindMap } from '@/utils/text-to-mindmap/markdown-parser';
import type { MindElixirData, MindElixirNode } from '@/utils/text-to-mindmap';

// PDF.js动态导入，避免SSR问题
let pdfjsLib: any = null;

/**
 * 动态加载PDF.js库
 */
async function loadPdfJs() {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    try {
      pdfjsLib = await import('pdfjs-dist');
      
      // 使用本地worker文件，避免CORS问题
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      console.log('PDF.js版本:', pdfjsLib.version);
      console.log('使用本地worker文件');
    } catch (error) {
      console.error('PDF.js加载失败:', error);
      throw new Error('PDF解析功能不可用');
    }
  }
  return pdfjsLib;
}

/**
 * 解析结果接口
 */
export interface ParseResult {
  success: boolean;
  data?: MindElixirData;
  error?: string;
  metadata?: {
    totalPages?: number;
    extractedText?: string;
    processingTime: number;
  };
}

/**
 * 检查文件类型是否支持前端解析
 * 支持PPTX和Markdown文件的直接前端解析
 * PDF和DOCX文件需要先判断树结构，不在此列表中
 */
export function isSupportedForFrontendParsing(file: File): boolean {
  const supportedTypes = [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.ms-powerpoint', // PPT (部分支持)
    'text/markdown', // Markdown
    'text/x-markdown' // Markdown (alternative MIME type)
  ];

  // 也检查文件扩展名，因为有些浏览器可能不正确识别Markdown的MIME类型
  const fileName = file.name.toLowerCase();
  const isMarkdownByExtension = fileName.endsWith('.md') || fileName.endsWith('.markdown');

  return supportedTypes.includes(file.type) || isMarkdownByExtension;
}

/**
 * 解析Markdown文件
 * 直接读取文本内容并使用专用Markdown解析器
 */
export async function parseMarkdownFile(file: File): Promise<ParseResult> {
  const startTime = Date.now();

  try {
    console.log('开始解析Markdown文件:', file.name);

    // 读取文件内容
    const text = await file.text();

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Markdown文件内容为空',
        metadata: {
          processingTime: Date.now() - startTime
        }
      };
    }

    console.log('Markdown文件内容长度:', text.length);
    console.log('Markdown文件前200字符:', text.substring(0, 200));

    // 使用专用的Markdown解析器
    const mindMapData = parseMarkdownToMindMap(text);

    const processingTime = Date.now() - startTime;
    console.log(`Markdown解析完成，耗时: ${processingTime}ms`);

    return {
      success: true,
      data: mindMapData,
      metadata: {
        extractedText: text,
        processingTime
      }
    };

  } catch (error) {
    console.error('Markdown解析失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Markdown文件解析失败',
      metadata: {
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * 解析PPTX文件
 * 使用jszip解压缩，xml2js解析XML结构
 */
export async function parsePPTXFile(file: File): Promise<ParseResult> {
  const startTime = Date.now();
  
  try {
    console.log('开始解析PPTX文件:', file.name);
    
    // 读取文件为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // 使用JSZip解压PPTX文件
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // 存储所有幻灯片内容
    const slides: Array<{
      slideNumber: number;
      title: string;
      content: string[];
    }> = [];
    
    // 获取幻灯片列表
    const slideFiles: Array<{ name: string; file: JSZip.JSZipObject }> = [];
    zip.forEach((relativePath, file) => {
      // 查找幻灯片文件 (ppt/slides/slide*.xml)
      if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
        slideFiles.push({ name: relativePath, file });
      }
    });
    
    // 按幻灯片编号排序
    slideFiles.sort((a, b) => {
      const aNum = parseInt(a.name.match(/slide(\d+)\.xml/)?.[1] || '0');
      const bNum = parseInt(b.name.match(/slide(\d+)\.xml/)?.[1] || '0');
      return aNum - bNum;
    });
    
    console.log(`找到 ${slideFiles.length} 个幻灯片`);
    
    // 解析每个幻灯片
    for (const slideFile of slideFiles) {
      try {
        const slideNumber = parseInt(slideFile.name.match(/slide(\d+)\.xml/)?.[1] || '0');
        const xmlContent = await slideFile.file.async('string');
        
        // 解析XML内容
        const slideData = await parseSlideXML(xmlContent);
        slides.push({
          slideNumber,
          title: slideData.title || `幻灯片 ${slideNumber}`,
          content: slideData.content
        });
        
        console.log(`解析完成幻灯片 ${slideNumber}: ${slideData.title}`);
      } catch (error) {
        console.warn(`解析幻灯片 ${slideFile.name} 失败:`, error);
      }
    }
    
    // 生成Mind-Elixir数据结构
    const mindMapData = generateMindMapFromSlides(slides, file.name);
    
    const processingTime = Date.now() - startTime;
    console.log(`PPTX解析完成，耗时: ${processingTime}ms`);
    
    return {
      success: true,
      data: mindMapData,
      metadata: {
        totalPages: slides.length,
        extractedText: slides.map(s => `${s.title}\n${s.content.join('\n')}`).join('\n\n'),
        processingTime
      }
    };
    
  } catch (error) {
    console.error('PPTX解析失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PPTX文件解析失败',
      metadata: {
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * 解析单个幻灯片的XML内容
 */
async function parseSlideXML(xmlContent: string): Promise<{ title: string; content: string[] }> {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, { explicitArray: false }, (err: any, result: any) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        const slide = result['p:sld'];
        const cSld = slide['p:cSld'];
        const spTree = cSld['p:spTree'];
        
        let title = '';
        const content: string[] = [];
        
        // 解析形状和文本框
        if (spTree && spTree['p:sp']) {
          const shapes = Array.isArray(spTree['p:sp']) ? spTree['p:sp'] : [spTree['p:sp']];
          
          for (const shape of shapes) {
            const textBody = shape['p:txBody'];
            if (textBody && textBody['a:p']) {
              const paragraphs = Array.isArray(textBody['a:p']) ? textBody['a:p'] : [textBody['a:p']];
              
              for (const paragraph of paragraphs) {
                const text = extractTextFromParagraph(paragraph);
                if (text) {
                  // 第一个非空文本作为标题
                  if (!title && text.length < 100) {
                    title = text;
                  } else if (text !== title) {
                    content.push(text);
                  }
                }
              }
            }
          }
        }
        
        resolve({ 
          title: title || '无标题', 
          content: content.filter(c => c.length > 0) 
        });
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

/**
 * 从段落中提取文本内容
 */
function extractTextFromParagraph(paragraph: any): string {
  let text = '';
  
  if (paragraph['a:r']) {
    const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']];
    for (const run of runs) {
      if (run['a:t']) {
        text += run['a:t'];
      }
    }
  }
  
  return text.trim();
}

/**
 * 从幻灯片数据生成Mind-Elixir格式
 */
function generateMindMapFromSlides(slides: Array<{ slideNumber: number; title: string; content: string[] }>, fileName: string): MindElixirData {
  // 使用文件名作为根节点
  const rootTitle = fileName.replace(/\.(pptx|ppt)$/i, '');
  
  const children = slides.map((slide, index) => ({
    topic: slide.title,
    id: `slide-${slide.slideNumber}`,
    children: slide.content.map((content, contentIndex) => ({
      topic: content.length > 50 ? content.substring(0, 50) + '...' : content,
      id: `slide-${slide.slideNumber}-content-${contentIndex}`,
      children: []
    }))
  }));
  
  return {
    nodeData: {
      topic: rootTitle,
      id: 'root',
      children
    }
  };
}

/**
 * 解析PDF文件
 * 使用PDF.js提取文本内容，智能识别章节结构
 */
export async function parsePDFFile(file: File): Promise<ParseResult> {
  const startTime = Date.now();
  
  try {
    console.log('开始解析PDF文件:', file.name);
    
    // 动态加载PDF.js
    const pdfjs = await loadPdfJs();
    
    // 读取文件为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // 加载PDF文档
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    console.log(`PDF共有 ${totalPages} 页`);
    
    // 提取所有页面的文本
    let fullText = '';
    const pageTexts: string[] = [];
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // 拼接页面文本
        const pageText = (textContent.items as any[])
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str)
          .join(' ');
        
        pageTexts.push(pageText);
        fullText += pageText + '\n\n';
        
        console.log(`解析完成第 ${pageNum} 页`);
      } catch (error) {
        console.warn(`解析第 ${pageNum} 页失败:`, error);
      }
    }
    
    // 清理和结构化文本
    const cleanedText = cleanPDFText(fullText);
    
    // 添加调试日志
    console.log('PDF原始文本长度:', fullText.length);
    console.log('PDF清理后文本长度:', cleanedText.length);
    console.log('PDF前500字符:', cleanedText.substring(0, 500));
    
    // 使用统一的智能文本解析逻辑
    const mindMapData = smartTextParse(cleanedText);
    
    console.log('前端解析生成的思维导图数据:', mindMapData);
    
    const processingTime = Date.now() - startTime;
    console.log(`PDF解析完成，耗时: ${processingTime}ms`);
    
    return {
      success: true,
      data: mindMapData,
      metadata: {
        totalPages,
        extractedText: cleanedText,
        processingTime
      }
    };
    
  } catch (error) {
    console.error('PDF解析失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF文件解析失败',
      metadata: {
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * 解析技术文档，生成思维导图结构
 */
function parseTechnicalDocument(text: string, fileName: string): MindElixirData {
  const rootTitle = fileName.replace(/\.(pdf|txt|docx)$/i, '');
  
  // 按段落分割文本
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // 技术概念分类
  const categories = {
    classes: [] as string[],
    interfaces: [] as string[],
    apis: [] as string[],
    components: [] as string[],
    configs: [] as string[],
    others: [] as string[]
  };
  
  // 分析每个段落
  for (const paragraph of paragraphs) {
    const cleanPara = paragraph.trim();
    
    // 识别类和组件
    if (cleanPara.match(/Controller|View|Cell|Container|Manager|Service/i)) {
      categories.components.push(cleanPara);
    }
    // 识别API和接口
    else if (cleanPara.match(/\/api\/|\/app\/|https?:\/\/|接口/)) {
      categories.apis.push(cleanPara);
    }
    // 识别配置和属性
    else if (cleanPara.match(/config|Config|配置|属性|参数/)) {
      categories.configs.push(cleanPara);
    }
    // 其他重要内容
    else if (cleanPara.length > 20 && cleanPara.length < 200) {
      categories.others.push(cleanPara);
    }
  }
  
  // 生成思维导图结构
  const children: MindElixirNode[] = [];
  let nodeId = 1;
  
  // 添加组件结构
  if (categories.components.length > 0) {
    children.push({
      topic: '组件架构',
      id: `node-${nodeId++}`,
      children: categories.components.slice(0, 8).map(comp => ({
        topic: extractKeyTerm(comp),
        id: `node-${nodeId++}`,
        children: []
      }))
    });
  }
  
  // 添加API接口
  if (categories.apis.length > 0) {
    children.push({
      topic: 'API接口',
      id: `node-${nodeId++}`,
      children: categories.apis.slice(0, 6).map(api => ({
        topic: extractKeyTerm(api),
        id: `node-${nodeId++}`,
        children: []
      }))
    });
  }
  
  // 添加配置信息
  if (categories.configs.length > 0) {
    children.push({
      topic: '配置设置',
      id: `node-${nodeId++}`,
      children: categories.configs.slice(0, 5).map(config => ({
        topic: extractKeyTerm(config),
        id: `node-${nodeId++}`,
        children: []
      }))
    });
  }
  
  // 添加其他重要信息
  if (categories.others.length > 0) {
    children.push({
      topic: '其他信息',
      id: `node-${nodeId++}`,
      children: categories.others.slice(0, 5).map(other => ({
        topic: extractKeyTerm(other),
        id: `node-${nodeId++}`,
        children: []
      }))
    });
  }
  
  // 如果没有识别到特定分类，使用段落结构
  if (children.length === 0) {
    children.push(...paragraphs.slice(0, 10).map(para => ({
      topic: extractKeyTerm(para),
      id: `node-${nodeId++}`,
      children: []
    })));
  }
  
  return {
    nodeData: {
      topic: rootTitle,
      id: 'root',
      children: children
    }
  };
}

/**
 * 提取关键术语，限制长度
 */
function extractKeyTerm(text: string): string {
  // 移除特殊字符，保留核心内容
  let cleaned = text
    .replace(/[^\u4e00-\u9fa5\w\s\-\.\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 如果太长，尝试提取前面的关键部分
  if (cleaned.length > 50) {
    // 优先提取包含重要术语的部分
    const importantTerms = cleaned.match(/[A-Z][a-zA-Z]*(?:Controller|View|Cell|Manager|Service|API|Config)/);
    if (importantTerms) {
      cleaned = importantTerms[0];
    } else {
      // 取前50个字符并在词边界截断
      cleaned = cleaned.substring(0, 50);
      const lastSpace = cleaned.lastIndexOf(' ');
      if (lastSpace > 20) {
        cleaned = cleaned.substring(0, lastSpace) + '...';
      }
    }
  }
  
  return cleaned || '未知项目';
}

/**
 * 清理PDF文本内容，保持段落结构
 */
function cleanPDFText(text: string): string {
  // 按现有的双换行分段
  let cleaned = text
    // 先保留双换行作为段落分隔符
    .replace(/\n\s*\n/g, '|||PARAGRAPH_BREAK|||')
    // 移除单个换行符，合并同一段落的文本
    .replace(/\n/g, ' ')
    // 移除多余的空格
    .replace(/\s+/g, ' ')
    // 恢复段落分隔符
    .replace(/\|\|\|PARAGRAPH_BREAK\|\|\|/g, '\n\n')
    // 移除页码和页眉页脚
    .replace(/第\s*\d+\s*页/g, '')
    .replace(/Page\s*\d+/gi, '')
    .trim();

  // 基于关键词和标点符号智能分段
  cleaned = cleaned
    // 在关键技术术语前添加换行
    .replace(/(埋点|下拉刷新|车图|接口|配置|组件架构|VehicleController|VehicleView|MPVehicle\.report)/g, '\n\n$1')
    // 在URL前添加换行
    .replace(/(https?:\/\/[^\s]+)/g, '\n$1')
    // 在API路径前添加换行
    .replace(/(\s)(\/app\/|\/api\/)/g, '$1\n$2')
    // 在重要标点后分段
    .replace(/([。！？：])\s*([A-Z\u4e00-\u9fa5])/g, '$1\n\n$2')
    // 清理多余的换行
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

/**
 * 解析章节结构
 * 识别"第X章"、"X.X"等章节标记
 */
function parseChapterStructure(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());
  const structuredLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 检测章节标题模式
    if (isChapterTitle(trimmedLine)) {
      // 添加适当的层级标记
      const level = getChapterLevel(trimmedLine);
      const indent = '  '.repeat(level - 1);
      structuredLines.push(`${indent}- ${trimmedLine}`);
    } else if (trimmedLine.length > 10) {
      // 普通内容段落
      structuredLines.push(`    ${trimmedLine}`);
    }
  }
  
  return structuredLines.join('\n');
}

/**
 * 判断是否为章节标题
 */
function isChapterTitle(text: string): boolean {
  // 中文章节模式：第X章、第X节、X.X、X.X.X
  const chinesePatterns = [
    /^第[一二三四五六七八九十\d]+[章节条]/,
    /^\d+[\.\s][^\d]/,
    /^\d+\.\d+/,
    /^[一二三四五六七八九十]+[、\s]/
  ];
  
  // 英文章节模式：Chapter X、Section X、X.X
  const englishPatterns = [
    /^Chapter\s+\d+/i,
    /^Section\s+\d+/i,
    /^\d+\.\s+[A-Z]/
  ];
  
  return [...chinesePatterns, ...englishPatterns].some(pattern => pattern.test(text));
}

/**
 * 获取章节层级
 */
function getChapterLevel(text: string): number {
  // 第X章 - 1级
  if (/^第[一二三四五六七八九十\d]+章/.test(text)) return 1;
  
  // 第X节 - 2级
  if (/^第[一二三四五六七八九十\d]+节/.test(text)) return 2;
  
  // X.X.X - 按点的数量确定层级
  const dotCount = (text.match(/\./g) || []).length;
  if (dotCount > 0) return Math.min(dotCount + 1, 4);
  
  // 默认2级
  return 2;
}

/**
 * 统一的前端文件解析器
 * 根据文件类型选择相应的解析器
 */
export async function parseFrontendFile(file: File): Promise<ParseResult> {
  if (!isSupportedForFrontendParsing(file)) {
    return {
      success: false,
      error: '文件类型不支持前端解析',
      metadata: { processingTime: 0 }
    };
  }

  // 检查文件扩展名以处理Markdown文件
  const fileName = file.name.toLowerCase();
  const isMarkdown = file.type === 'text/markdown' ||
                    file.type === 'text/x-markdown' ||
                    fileName.endsWith('.md') ||
                    fileName.endsWith('.markdown');

  if (isMarkdown) {
    return await parseMarkdownFile(file);
  }

  switch (file.type) {
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
      return await parsePPTXFile(file);

    case 'application/pdf':
      return await parsePDFFile(file);

    default:
      return {
        success: false,
        error: '不支持的文件类型',
        metadata: { processingTime: 0 }
      };
  }
}