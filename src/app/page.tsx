'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MindElixirViewer } from '@/components/mindmap/MindElixirViewer';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { FAQSection } from '@/components/home/FAQSection';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Upload,
  FileText,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import type { InputMode, ProcessingStatus } from '@/lib/types';
import { textConfig, fileTypeConfig } from '@/lib/config/app';
import { parseFrontendFile, isSupportedForFrontendParsing } from '@/utils/frontend-parser';



import type { MindElixirData } from '@/utils/text-to-mindmap';

type MindMapData = MindElixirData;

export default function HomePage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<InputMode>('text_input');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGlobalDragOver, setIsGlobalDragOver] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [textContent, setTextContent] = useState<string>('');

  // 定义 validateAndSetFile 函数
  const validateAndSetFile = useCallback((file: File) => {
    // 立即清空之前的思维导图和相关状态
    setMindMapData(null);
    setError(null);
    setProcessingStatus('idle');
    setProgress(0);
    setStatusMessage('');

    // 获取文件扩展名
    const fileExtension = file.name.toLowerCase().split('.').pop();

    // 检查是否是Markdown文件
    const isMarkdownFile = fileExtension === 'md' || fileExtension === 'markdown';

    // 检查是否是其他支持的扩展名
    const isValidExtension = fileTypeConfig.acceptedExtensions.some(ext =>
      ext.toLowerCase() === `.${fileExtension}`
    );

    console.log('文件验证:', file.name, '类型:', file.type, '扩展名:', fileExtension,
      'Markdown?', isMarkdownFile, '有效扩展名?', isValidExtension);

    // 如果是Markdown文件，直接通过验证
    if (isMarkdownFile) {
      // 如果是Markdown文件但MIME类型不正确，修正MIME类型
      if (file.type !== 'text/markdown') {
        try {
          // 尝试修改文件类型
          Object.defineProperty(file, 'type', {
            writable: true,
            value: 'text/markdown'
          });
          console.log('已将文件类型修改为text/markdown');
        } catch (e) {
          console.error('无法修改文件类型:', e);
          // 即使无法修改，也允许文件通过
        }
      }

      setSelectedFile(file);
      setError(null);
      return true;
    }

    // 验证文件类型（检查MIME类型或文件扩展名）
    if (!fileTypeConfig.acceptedMimeTypes.includes(file.type) && !isValidExtension) {
      console.log('文件验证失败:', file.name, file.type, '扩展名:', fileExtension);
      setError(t('main.errorUnsupportedFile'));
      return false;
    }

    // 验证文件大小
    if (file.size > fileTypeConfig.maxSize) {
      setError(t('main.errorFileTooLarge').replace('{maxSize}', (fileTypeConfig.maxSize / (1024 * 1024)).toString()));
      return false;
    }

    setSelectedFile(file);
    setError(null);
    return true;
  }, [setError, setSelectedFile, t]);

  // 全局拖拽事件监听
  useEffect(() => {
    let dragCounter = 0;

    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;

      // 检查是否包含文件
      if (e.dataTransfer?.types.includes('Files')) {
        setIsGlobalDragOver(true);
        // 如果当前不在文件上传tab，自动切换
        if (activeTab !== 'file_upload') {
          setActiveTab('file_upload');
        }
      }
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;

      if (dragCounter === 0) {
        setIsGlobalDragOver(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsGlobalDragOver(false);

      // 检查是否包含文件
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        // 确保切换到文件上传tab
        setActiveTab('file_upload');
        // 处理文件
        validateAndSetFile(e.dataTransfer.files[0]);
      }
    };

    // 添加全局事件监听
    document.addEventListener('dragenter', handleGlobalDragEnter);
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);

    // 清理事件监听
    return () => {
      document.removeEventListener('dragenter', handleGlobalDragEnter);
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [activeTab, validateAndSetFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleTextSubmit = async () => {
    const minLength = 50; // Minimum 50 characters

    if (!textInput.trim() || textInput.trim().length < minLength) {
      setError(t('main.errorNoText'));
      return;
    }

    if (textInput.length > textConfig.maxLength) {
      setError(t('main.errorTextTooLong').replace('{maxLength}', textConfig.maxLength.toString()));
      return;
    }

    await processMindMap('text_input', textInput);
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      setError(t('main.errorNoFile'));
      return;
    }

    console.log('处理文件:', selectedFile.name, '类型:', selectedFile.type, '大小:', selectedFile.size);
    await processMindMap('file_upload', selectedFile);
  };

  const processMindMap = async (type: InputMode, content: string | File) => {
    setError(null);
    setProcessingStatus('uploading');
    setProgress(0);
    setMindMapData(null); // 清除之前的思维导图

    // 模拟步骤进度显示
    const updateProgress = (step: string, progress: number) => {
      setStatusMessage(step);
      setProgress(progress);
    };

    try {
      updateProgress(t('main.preparing'), 10);
      setProcessingStatus('uploading');

      // 判断文本是否是树结构的函数（增强版）
      const isTreeStructure = (text: string): boolean => {
        const trimmed = text.trim();
        const lines = text.split('\n').filter(Boolean);
        const trimmedLines = lines.map(line => line.trim()).filter(Boolean);

        // 优先检测结构化格式
        if (/^[\[{]/.test(trimmed)) return true;                    // JSON
        if (/^</.test(trimmed)) return true;                        // XML

        // 检测智能大纲格式（章节 + 编号小节）
        const chapterCount = trimmedLines.filter(line => /^第[一二三四五六七八九十\d]+章\s*.+/.test(line)).length;
        const sectionCount = trimmedLines.filter(line => /^\d+\.\d+(?:\.\d+)?\s+.+/.test(line)).length;
        if (chapterCount > 0 && sectionCount > 0) return true;

        // 检查是否有缩进或层级结构（使用原始行，不是trim后的）
        const hasIndentation = lines.some(line => /^\s+/.test(line));

        // 检查是否有列表标记（使用原始行）
        const hasListMarkers = lines.some(line => /^(\s*)[-•*+]\s/.test(line));

        // 检查是否有编号列表（使用原始行）
        const hasNumberedList = lines.some(line => /^(\s*)\d+[\.\)]\s/.test(line));

        // 检查是否有Markdown标题格式（使用trim后的行）
        const hasMarkdownHeadings = trimmedLines.some(line => /^#{1,6}\s+.+/.test(line));

        // 检查是否有明显的章节标题（使用trim后的行）
        const hasChapterTitles = trimmedLines.some(line =>
          /^第[一二三四五六七八九十\d]+[章节]/.test(line) ||
          /^[一二三四五六七八九十]+[、\s]/.test(line) ||
          /^\d+\.\d+/.test(line) ||
          /^Chapter\s+\d+/i.test(line) ||
          /^Section\s+\d+/i.test(line)
        );

        // 检查更多树结构格式
        const hasChineseNumbering = trimmedLines.some(line =>
          /^[一二三四五六七八九十]+、/.test(line) ||
          /^（[一二三四五六七八九十]+）/.test(line)
        );

        const hasRomanNumbering = trimmedLines.some(line =>
          /^[IVXLCDM]+\.\s/.test(line) ||
          /^[A-Z]\.\s/.test(line)
        );

        const hasTreeFormat = lines.some(line =>
          /^[│├└]\s*/.test(line) ||
          /^[├└]──/.test(line)
        );

        const hasQAFormat = trimmedLines.some(line =>
          /^[QA]:\s/.test(line) ||
          /^问[:：]\s/.test(line) ||
          /^答[:：]\s/.test(line)
        );

        const hasMultiLevelNumbering = trimmedLines.some(line =>
          /^\d+\.\d+\.\d+/.test(line)
        );

        // 检测路径格式
        const hasPathFormat = trimmedLines.some(line =>
          /^[^\n\/]+\/.+/.test(line)
        );

        // 检测Org-mode格式（多个*开头）
        const hasOrgMode = trimmedLines.some(line =>
          /^\*{2,}\s/.test(line)  // 至少两个*，避免与单个*的列表冲突
        );

        // 特别针对PDF内容的检测 - 检测课程/培训类结构
        const hasCourseStructure = trimmedLines.some(line =>
          /^(探索|学习|掌握|了解|深入|实操|创意|原型|成果)/.test(line) ||
          /基础知识$/.test(line) ||
          /路线图$/.test(line) ||
          /实践$/.test(line) ||
          /演练$/.test(line) ||
          /实战$/.test(line) ||
          /展现$/.test(line)
        );

        // 检测是否有明显的主题-描述结构（PDF常见格式）
        const hasTopicDescriptionStructure = (() => {
          let topicCount = 0;
          let descriptionCount = 0;
          
          for (let i = 0; i < trimmedLines.length - 1; i++) {
            const currentLine = trimmedLines[i];
            const nextLine = trimmedLines[i + 1];
            
            // 检测短标题行后跟长描述行的模式
            if (currentLine.length < 30 && nextLine.length > 50) {
              topicCount++;
            }
            
            // 检测描述性文本
            if (nextLine.includes('。') || nextLine.includes('，') || nextLine.includes('的')) {
              descriptionCount++;
            }
          }
          
          return topicCount >= 3 && descriptionCount >= 3;
        })();

        console.log('文本结构分析:', {
          hasIndentation,
          hasListMarkers,
          hasNumberedList,
          hasMarkdownHeadings,
          hasChapterTitles,
          hasPathFormat,
          hasOrgMode,
          hasCourseStructure,
          hasTopicDescriptionStructure,
          textLength: text.length,
          lineCount: trimmedLines.length
        });

        // 如果有以上任一特征，认为是树结构
        return hasIndentation || hasListMarkers || hasNumberedList || hasChapterTitles ||
          hasMarkdownHeadings || hasChineseNumbering || hasRomanNumbering ||
          hasTreeFormat || hasQAFormat || hasMultiLevelNumbering ||
          hasPathFormat || hasOrgMode || hasCourseStructure || hasTopicDescriptionStructure;
      };

      // 处理文本内容的函数（无论是直接输入还是从文件中提取）
      const processTextContent = async (textContent: string, source: string): Promise<boolean> => {
        // 检查文件名或MIME类型是否表明这是Markdown文件
        const isSourceMarkdown = source === 'text/markdown' ||
          (typeof source === 'string' &&
            (source.toLowerCase().endsWith('.md') ||
              source.toLowerCase().endsWith('.markdown')));

        // 检查内容是否包含Markdown特征
        const hasMarkdownHeadings = textContent.split('\n')
          .some(line => /^#{1,6}\s+.+/.test(line.trim()));
        const hasMarkdownCodeBlocks = textContent.includes('```');
        const hasMarkdownLinks = textContent.includes('](');
        const hasMarkdownLists = textContent.split('\n')
          .filter(line => /^\s*[-*+]\s+.+/.test(line)).length > 2;

        // 如果是Markdown文件或内容看起来像Markdown，直接使用Markdown解析器
        const isMarkdown = isSourceMarkdown || hasMarkdownHeadings ||
          hasMarkdownCodeBlocks || (hasMarkdownLinks && hasMarkdownLists);

        console.log('文本内容分析:',
          '源是Markdown?', isSourceMarkdown,
          '有Markdown标题?', hasMarkdownHeadings,
          '有代码块?', hasMarkdownCodeBlocks,
          '有链接?', hasMarkdownLinks,
          '有列表?', hasMarkdownLists,
          '最终判断:', isMarkdown ? 'Markdown' : '非Markdown');

        // DOCX文件特殊处理：先尝试前端解析，根据结果判断是否为树结构
        if (source === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          console.log('🔍 DOCX文件：尝试前端解析并检测结构...');

          try {
            // 导入智能文本解析函数
            const { smartTextParse } = await import('@/utils/text-to-mindmap');
            // 尝试解析DOCX内容
            const docxMindMapData = smartTextParse(textContent);

            // 检查解析结果是否有足够的结构
            const rootNode = docxMindMapData?.nodeData;
            const hasChildren = rootNode?.children && rootNode.children.length > 0;
            const totalNodes = hasChildren ?
              1 + rootNode.children.reduce((sum, child) => sum + 1 + (child.children?.length || 0), 0) : 1;

            console.log(`📊 DOCX解析结果: 根节点="${rootNode?.topic}", 子节点=${rootNode?.children?.length || 0}, 总节点=${totalNodes}`);

            // 如果有足够的结构（至少3个节点），认为是树结构
            if (totalNodes >= 3) {
              console.log('✅ DOCX文件解析出足够结构，使用前端解析结果');

              updateProgress(t('main.generating'), 80);
              setProcessingStatus('generating');

              // 等待一小段时间，让用户感知到处理过程
              await new Promise(resolve => setTimeout(resolve, 500));

              updateProgress(t('main.completed'), 100);
              setProcessingStatus('completed');
              setStatusMessage(t('main.completed'));

              setMindMapData(docxMindMapData);
              console.log('DOCX前端解析生成的思维导图数据:', docxMindMapData);

              return true; // 处理成功
            } else {
              console.log('❌ DOCX文件结构不足，将使用后端API解析');
              // 继续走后端API流程，返回false
              return false;
            }
          } catch (error) {
            console.log('❌ DOCX前端解析失败，将使用后端API:', error);
            // 继续走后端API流程，返回false
            return false;
          }
        }

        if (isMarkdown || isTreeStructure(textContent)) {
          console.log(`检测到${source}内容是Markdown或树结构，使用前端解析`);

          updateProgress(t('main.parsing'), 30);
          setProcessingStatus('processing');

          let mindMapData;

          if (isMarkdown) {
            console.log('检测到Markdown格式，使用专用Markdown解析器');
            // 导入Markdown解析器
            const { parseMarkdownToMindMap } = await import('@/utils/text-to-mindmap/markdown-parser');
            // 使用Markdown解析器处理文本
            mindMapData = parseMarkdownToMindMap(textContent);
          } else {
            // 导入智能文本解析函数
            const { smartTextParse } = await import('@/utils/text-to-mindmap');
            // 使用通用解析器处理文本
            mindMapData = smartTextParse(textContent);
          }

          updateProgress(t('main.generating'), 80);
          setProcessingStatus('generating');

          // 等待一小段时间，让用户感知到处理过程
          await new Promise(resolve => setTimeout(resolve, 500));

          updateProgress(t('main.completed'), 100);
          setProcessingStatus('completed');
          setStatusMessage(t('main.completed'));

          setMindMapData(mindMapData);
          console.log('前端解析生成的思维导图数据:', mindMapData);

          return true; // 处理成功
        }

        return false; // 需要API处理
      };

      // 判断是否需要前端解析
      let extractedTextContent = ''; // 用于存储从文件中提取的文本内容
      
      if (type === 'file_upload') {
        const file = content as File;

        // 检查是否支持前端解析（PPTX）
        if (isSupportedForFrontendParsing(file)) {
          console.log('使用前端解析:', file.name, file.type);

          updateProgress(t('main.parsing'), 30);
          setProcessingStatus('processing');

          // 前端解析文件
          const parseResult = await parseFrontendFile(file);

          if (!parseResult.success) {
            throw new Error(parseResult.error || '文件解析失败');
          }

          updateProgress(t('main.generating'), 80);
          setProcessingStatus('generating');

          // 直接使用解析结果
          await new Promise(resolve => setTimeout(resolve, 500));

          updateProgress(t('main.completed'), 100);
          setProcessingStatus('completed');
          setStatusMessage(t('main.completed'));

          setMindMapData(parseResult.data!);
          console.log('前端解析生成的思维导图数据:', parseResult.data);

          return;
        }

        // 检查是否是可以读取文本内容的文件类型
        const textBasedFileTypes = [
          'text/plain',                                                   // TXT
          'text/markdown',                                                // Markdown
          'application/pdf',                                              // PDF
          'application/msword',                                           // DOC
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
        ];

        if (textBasedFileTypes.includes(file.type)) {
          console.log(`检测到${file.type}文件，尝试前端解析`);

          updateProgress(t('main.readingFile'), 20);

          try {
            // 根据文件类型或扩展名选择不同的读取方法
            const fileExtension = file.name.toLowerCase().split('.').pop();
            const isMarkdownFile = file.type === 'text/markdown' ||
              fileExtension === 'md' ||
              fileExtension === 'markdown';

            console.log('文件处理:', file.name, '类型:', file.type, '扩展名:', fileExtension, 'Markdown?', isMarkdownFile);

            // 对于文本文件和Markdown文件，直接读取内容
            if (file.type === 'text/plain' || file.type === 'text/markdown' ||
              file.type === '' || file.type === 'application/octet-stream' || // 处理未知MIME类型
              isMarkdownFile) {
              // 直接读取TXT或Markdown文件内容
              extractedTextContent = await file.text();

              // 如果是Markdown文件但MIME类型不正确，修正MIME类型
              if (isMarkdownFile && file.type !== 'text/markdown') {
                console.log('检测到Markdown文件，但MIME类型不正确，修正为text/markdown');
                try {
                  // 尝试修改文件类型
                  Object.defineProperty(file, 'type', {
                    writable: true,
                    value: 'text/markdown'
                  });
                } catch (e) {
                  console.error('无法修改文件类型:', e);
                  // 即使无法修改，也继续处理
                }
              }

              // 如果文件名不是以.md结尾，但内容看起来像Markdown，标记为Markdown
              if (!isMarkdownFile) {
                // 检查是否包含Markdown特征
                const hasMarkdownHeadings = textContent.split('\n').some(line => /^#{1,6}\s+.+/.test(line.trim()));
                const hasMarkdownLinks = textContent.includes('](');
                const hasMarkdownCodeBlocks = textContent.includes('```');
                const hasMarkdownEmphasis = textContent.includes('**') || textContent.includes('__');

                if (hasMarkdownHeadings || hasMarkdownCodeBlocks || (hasMarkdownLinks && hasMarkdownEmphasis)) {
                  console.log('文件内容看起来像Markdown，将按Markdown格式处理');
                  // 使用Object.defineProperty修改只读属性
                  Object.defineProperty(file, 'type', {
                    writable: true,
                    value: 'text/markdown'
                  });
                }
              }
            } else if (file.type === 'application/pdf') {
              // 使用PDF.js读取PDF文件内容
              try {
                console.log('🔍 检测到PDF文件，开始前端文本提取...');
                
                // 动态导入PDF.js
                const pdfjs = await import('pdfjs-dist');

                // 设置worker
                pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

                // 读取文件为ArrayBuffer
                const arrayBuffer = await file.arrayBuffer();

                // 加载PDF文档
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const totalPages = pdf.numPages;

                console.log(`📄 PDF共有 ${totalPages} 页`);

                // 提取所有页面的文本
                let fullText = '';

                for (let pageNum = 1; pageNum <= Math.min(totalPages, 20); pageNum++) {
                  try {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();

                    // 改进文本拼接逻辑，保持更好的结构
                    const pageText = textContent.items
                      .filter((item: { str?: string }) => item.str && item.str.trim())
                      .map((item: { str: string }) => item.str.trim())
                      .join(' '); // 先用空格连接同一页的文本

                    fullText += pageText + '\n'; // 页面之间用换行分隔

                    console.log(`✅ 解析完成第 ${pageNum} 页`);
                  } catch (error) {
                    console.warn(`⚠️ 解析第 ${pageNum} 页失败:`, error);
                  }
                }

                // 简单清理文本
                const extractedTextContent = fullText
                  .split('\n')
                  .map(line => line.trim())
                  .filter(line => line.length > 0)
                  .join('\n');
                
                // 设置全局变量textContent
                setTextContent(extractedTextContent);

                console.log('📊 PDF文本提取完成:');
                console.log(`  - 文本长度: ${textContent.length}`);
                console.log(`  - 文本前200字符: ${textContent.substring(0, 200)}`);
                console.log('📤 PDF文本将通过API处理');
                
              } catch (error) {
                console.error('❌ PDF文本提取失败:', error);
                throw new Error('PDF文本提取失败');
              }
            } else if (file.type.includes('word') ||
              file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
              file.type === 'application/msword') {
              // 对于DOC/DOCX文件，先尝试提取文本判断是否树结构
              console.log('🔍 检测到Word文档，文件类型:', file.type);
              console.log('📄 文件名:', file.name, '大小:', file.size);
              console.log('🚀 开始尝试提取文本判断树结构...');

              try {
                // 对于DOCX文件，尝试使用JSZip提取文本（仅用于树结构判断）
                if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                  console.log('📦 检测到DOCX文件，尝试使用JSZip提取文本...');

                  // 动态导入JSZip
                  const JSZip = (await import('jszip')).default;
                  const arrayBuffer = await file.arrayBuffer();
                  console.log('📊 ArrayBuffer大小:', arrayBuffer.byteLength);

                  const zip = await JSZip.loadAsync(arrayBuffer);
                  console.log('✅ JSZip加载成功');

                  // 读取document.xml文件
                  const documentXml = await zip.file('word/document.xml')?.async('text');
                  console.log('📄 document.xml读取结果:', documentXml ? '成功' : '失败');

                  if (documentXml) {
                    console.log('📝 document.xml长度:', documentXml.length);

                    // 提取文本内容，更智能地处理段落和章节
                    const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
                    console.log('🔍 找到文本匹配数量:', textMatches?.length || 0);

                    if (textMatches && textMatches.length > 0) {
                      let extractedText = textMatches
                        .map(match => match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1'))
                        .join(' ')  // 先用空格连接
                        .replace(/[ \t]+/g, ' ')  // 合并多个空格
                        .trim();

                      // 智能添加换行符：在章节标题、编号列表等位置添加换行
                      extractedText = extractedText
                        .replace(/(第[一二三四五六七八九十\d]+章)/g, '\n$1')  // 章节标题前换行
                        .replace(/(\d+\.\d+)/g, '\n$1')  // 编号小节前换行
                        .replace(/(•|·|-)\s+/g, '\n$1 ')  // 列表项前换行
                        .replace(/([。！？])\s*([第\d])/g, '$1\n$2')  // 句号后跟章节或数字时换行
                        .replace(/^\n+/, '')  // 移除开头的换行
                        .replace(/\n+/g, '\n')  // 合并多个换行
                        .trim();

                      console.log('✅ DOCX文本提取成功！');
                      console.log('📊 提取文本长度:', extractedText.length);
                      console.log('📄 提取的文本前300字符:', extractedText.substring(0, 300));

                      if (extractedText.length > 50) {
                        extractedTextContent = extractedText;
                        console.log('✅ 文本内容设置成功，准备进行树结构检测');
                      } else {
                        console.log('⚠️ 提取的文本太短，长度:', extractedText.length);
                      }
                    } else {
                      console.log('❌ 没有找到文本内容匹配');
                    }
                  } else {
                    console.log('❌ 无法读取document.xml文件');
                  }
                } else if (file.type === 'application/msword') {
                  console.log('📄 检测到DOC文件，DOC是较老的二进制格式');
                  console.log('⚠️ DOC格式前端无法解析，需要后端处理');
                  console.log('💡 建议：将DOC文件转换为DOCX格式以获得更好的支持');
                  throw new Error('DOC文件需要后端处理');
                }

                // 如果没有提取到足够的文本，抛出错误走API路径
                if (!extractedTextContent || extractedTextContent.length < 50) {
                  console.log('⚠️ 文本提取不足，长度:', extractedTextContent?.length || 0);
                  console.log('🔄 将使用后端API处理');
                  throw new Error('Word文档文本提取不足，使用后端处理');
                }

              } catch (error) {
                console.log('❌ Word文档文本提取失败，使用后端API处理');
                console.log('📋 错误详情:', error.message);
                throw new Error('Word文档需要后端处理');
              }
            }

            // 处理提取的文本内容
            if (textContent && textContent.length > 0) {
              // PDF文件直接走API，不进行前端解析
              if (file.type === 'application/pdf') {
                console.log('📤 PDF文件提取文本完成，直接使用API处理');
                // 不调用processTextContent，直接跳到API处理
              } else {
                // 其他文件类型进行前端解析判断
                const fileExtension = file.name.toLowerCase().split('.').pop();
                const isMarkdownFile = fileExtension === 'md' || fileExtension === 'markdown';

                const source = isMarkdownFile ? file.name : file.type;
                console.log('📝 开始处理提取的文本内容');
                console.log('📊 文本长度:', textContent.length);
                console.log('🏷️ 使用source:', source);
                console.log('📄 文本前200字符:', textContent.substring(0, 200));

                const processed = await processTextContent(textContent, source);
                if (processed) {
                  console.log('✅ 文本内容处理成功，使用前端解析');
                  return; // 如果成功处理，直接返回
                } else {
                  console.log('❌ 文本内容处理失败，不是树结构或处理出错');
                }
              }
            } else {
              console.log('⚠️ 没有提取到有效的文本内容');
            }

            console.log(`${file.type}文件内容不是树结构或提取失败，使用API处理`);
          } catch (err) {
            console.error(`读取${file.type}文件失败:`, err);
            // 如果读取失败，继续使用API处理
          }
        }
      } else if (type === 'text_input') {
        // 处理直接输入的文本
        const inputText = content as string;
        setTextContent(inputText); // 设置全局textContent
        const processed = await processTextContent(inputText, '文本输入');
        if (processed) {
          return; // 如果成功处理，直接返回
        }
      }

      // 其他文件类型或非树结构文本，使用后端API处理
      console.log('使用后端API处理');

      // 创建FormData
      const formData = new FormData();
      formData.append('type', type);

      if (type === 'file_upload') {
        const file = content as File;
        
        // 对于PDF文件，如果已经提取了文本，发送文本内容而不是文件
        if (file.type === 'application/pdf' && textContent && textContent.length > 0) {
          console.log('📤 发送PDF提取的文本内容到API');
          formData.append('type', 'text_input'); // 改为文本输入类型
          formData.append('content', textContent);
          formData.append('title', file.name.replace(/\.[^/.]+$/, '') + ' (PDF提取)');
        } else {
          // 其他文件直接发送文件
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        formData.append('content', content as string);
        formData.append('title', '手动输入的文档');
      }

      updateProgress(t('main.uploading'), 20);

      // 调用API
      const response = await fetch('/api/mindmap/generate', {
        method: 'POST',
        body: formData
      });

      updateProgress(t('main.processing'), 50);
      setProcessingStatus('processing');

      // 检查响应状态和内容
      const responseText = await response.text();

      if (!response.ok) {
        console.error('API响应错误:', response.status, responseText);

        // 动态导入验证工具
        const { isHtmlErrorPage, extractErrorFromHtml, safeJsonParse } = await import('@/utils/api-response-validator');

        // 检查是否是HTML错误页面
        if (isHtmlErrorPage(responseText)) {
          const { message, code } = extractErrorFromHtml(responseText);
          throw new Error(message);
        }

        // 尝试解析JSON错误信息
        const parseResult = safeJsonParse(responseText);
        if (parseResult.success && parseResult.data?.error) {
          throw new Error(parseResult.data.error.message || `服务器错误 (${response.status})`);
        }

        // 回退到通用错误
        throw new Error(`服务器错误 (${response.status}): ${responseText.substring(0, 100)}`);
      }

      // 安全解析JSON响应
      const { safeJsonParse } = await import('@/utils/api-response-validator');
      const parseResult = safeJsonParse(responseText);

      if (!parseResult.success) {
        console.error('JSON解析错误:', parseResult.error);
        console.error('响应内容:', responseText.substring(0, 200));
        throw new Error('服务器返回了无效的响应格式');
      }

      const result = parseResult.data;

      if (!result.success) {
        // 检查是否是DOC文件不支持的错误
        if (result.error?.code === 'DOC_NOT_SUPPORTED' ||
          result.error?.message?.includes('DOC_NOT_SUPPORTED')) {
          const errorMessage = t('main.errorDocNotSupported');
          throw new Error(typeof errorMessage === 'string' ? errorMessage : errorMessage.toString());
        }

        // 检查是否是文件过大错误
        if (result.error?.code === 'FILE_TOO_LARGE') {
          throw new Error('文件过大，请选择小于9MB的文件');
        }
        throw new Error(result.error?.message || 'API调用失败');
      }

      updateProgress(t('main.generating'), 90);
      setProcessingStatus('generating');

      // 模拟最后的处理时间
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateProgress(t('main.completed'), 100);
      setProcessingStatus('completed');
      setStatusMessage(t('main.completed'));

      // 设置思维导图数据，在右侧显示
      setMindMapData(result.data);
      console.log('后端API生成的思维导图数据:', result.data);

    } catch (err) {
      console.error('处理失败:', err);
      setError(err instanceof Error ? err.message : '处理失败，请重试');
      setProcessingStatus('error');
    }
  };

  const resetForm = () => {
    setProcessingStatus('idle');
    setProgress(0);
    setStatusMessage('');
    setTextInput('');
    setSelectedFile(null);
    setError(null);
    setMindMapData(null);
  };

  const isProcessing = processingStatus !== 'idle' && processingStatus !== 'completed' && processingStatus !== 'error';

  return (
    <MainLayout>
      {/* 全局拖拽覆盖层 */}
      {isGlobalDragOver && activeTab === 'text_input' && (
        <div className="fixed inset-0 bg-blue-500/30 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-black/80 border border-white/10 rounded-xl p-8 shadow-2xl text-center max-w-md mx-4 backdrop-blur-lg">
            <Upload className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t('main.fileDropActive')}</h3>
            <p className="text-gray-300 mb-4">
              {t('main.fileDragDetected')}
            </p>
            <p className="text-sm text-gray-400">
              {t('main.fileSupport')}
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* 主内容区 */}
      <div id="main-content" className="relative py-24 overflow-hidden bg-black text-white">
        {/* 背景网格 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* 渐变光晕 */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* 输入区域 */}
            <Card className="w-full shadow-xl border-0 bg-white/5 backdrop-blur-md border border-white/10">
              <CardHeader className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/10">
                <CardTitle className="text-2xl text-white">{t('main.title')}</CardTitle>
                <CardDescription className="text-gray-300">
                  {t('main.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <Tabs value={activeTab} onValueChange={(value) => {
                  setActiveTab(value as InputMode);
                  // 切换标签页时清空之前的状态
                  setError(null);
                  setMindMapData(null);
                  setProcessingStatus('idle');
                  setProgress(0);
                  setStatusMessage('');
                }}>
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="text_input" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">{t('main.textTab')}</TabsTrigger>
                    <TabsTrigger value="file_upload" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">{t('main.fileTab')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text_input" className="space-y-4 pt-4">
                    <Textarea
                      placeholder={t('main.textPlaceholder')}
                      value={textInput}
                      onChange={(e) => {
                        setTextInput(e.target.value);
                        // 当用户开始输入新内容时，清空之前的思维导图
                        if (mindMapData) {
                          setMindMapData(null);
                          setError(null);
                          setProcessingStatus('idle');
                          setProgress(0);
                          setStatusMessage('');
                        }
                      }}
                      className="min-h-[200px] resize-none bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isProcessing}
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className={textInput.trim().length < 50 ? "text-red-400" : "text-green-400"}>
                        {textInput.length} / {textConfig.maxLength} {t('main.charCount')}
                        {textInput.trim().length < 50 && ` (${t('main.errorNoText')})`}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const testText = `智能文本解析测试文档
第一章 项目概述
本项目旨在开发一个智能文本解析系统，能够自动识别文本结构并生成思维导图。

1.1 项目背景
随着信息时代的到来，人们需要处理越来越多的文档。传统的文档阅读方式效率低下，急需一种能够快速理解文档结构的工具。

1.2 项目目标
- 实现智能文本层级识别
- 支持多种文档格式
- 生成可视化思维导图
- 提供友好的用户界面

第二章 技术架构
系统采用前后端分离的架构设计，前端使用React技术栈，后端使用Node.js。

2.1 前端技术栈
• React 18.3.1
• TypeScript 5.8.3
• Tailwind CSS 3.4.17
• Next.js 15.3.2

2.2 后端技术栈
• Node.js
• Express.js
• OpenAI API
• PDF.js

第三章 核心功能
系统的核心功能包括文件解析、文本分析和思维导图生成。

3.1 文件解析模块
支持多种格式的文件解析，包括TXT、PDF、DOCX等格式。每种格式都有专门的解析器进行处理。

3.2 文本分析模块
使用人工智能技术对文本进行智能分析，识别文档的层级结构。主要包括标题识别、段落分析、关键词提取等功能。

3.3 思维导图生成模块
基于分析结果生成结构化的思维导图。使用Markmap库进行可视化渲染，支持交互式操作。

总结：本系统通过智能文本解析技术，为用户提供了一个高效的文档理解工具。`;
                          setTextInput(testText);
                        }}
                      >
                        {t('main.testButton')}
                      </Button>
                    </div>
                    <Button
                      onClick={handleTextSubmit}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                      disabled={isProcessing || !textInput.trim() || textInput.trim().length < 50}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('main.processingButton')}
                        </>
                      ) : (
                        t('main.generateButton')
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="file_upload" className="space-y-4 pt-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragOver || isGlobalDragOver ? 'border-blue-400 bg-blue-500/10' : 'border-white/20 hover:border-white/40'
                        } ${selectedFile ? 'border-green-400 bg-green-500/10' : ''}`}
                      onClick={() => document.getElementById('file-upload')?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-white">
                          {selectedFile ? `${t('main.fileSelected')}${selectedFile.name}` :
                            (isDragOver || isGlobalDragOver) ? t('main.fileDropActive') : t('main.fileDropText')}
                        </p>
                        <p className="text-sm text-gray-400">
                          {t('main.fileSupport')} (.txt, .docx, .doc, .pptx, .ppt, <span className="text-blue-400 font-medium">.md</span>)
                        </p>
                        {isGlobalDragOver && (
                          <p className="text-sm text-blue-400 font-medium">
                            {t('main.fileDragDetected')}
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".txt,.docx,.doc,.pptx,.ppt,.md,.markdown"
                        className="hidden"
                        id="file-upload"
                        disabled={isProcessing}
                      />
                    </div>
                    {selectedFile && (
                      <Button
                        onClick={() => setSelectedFile(null)}
                        variant="outline"
                        className="w-full mb-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 hover:text-white"
                        disabled={isProcessing}
                      >
                        {t('main.selectFileAgain')}
                      </Button>
                    )}
                    <Button
                      onClick={handleFileSubmit}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                      disabled={isProcessing || !selectedFile}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('main.processingButton')}
                        </>
                      ) : (
                        t('main.uploadButton')
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* 处理状态显示 */}
                {isProcessing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">{statusMessage}</span>
                      <span className="text-sm text-gray-400">{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full bg-white/10" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />
                  </div>
                )}

                {/* 错误信息显示 */}
                {error && (
                  <Alert className="border-red-500/20 bg-red-500/10 text-red-300">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* 成功信息显示 */}
                {processingStatus === 'completed' && !error && (
                  <Alert className="border-green-500/20 bg-green-500/10 text-green-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">
                      {statusMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* 重置按钮 */}
                {(processingStatus === 'completed' || processingStatus === 'error') && (
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 hover:text-white"
                  >
                    {t('main.resetButton')}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 思维导图展示区 */}
            {mindMapData && (
              <div className="mt-12">
                <Card className="border-0 shadow-xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10">
                  <CardHeader className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/10">
                    <CardTitle className="text-white">{t('main.resultTitle')}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {t('main.resultDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[600px] bg-black/30">
                      <MindElixirViewer data={mindMapData} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* FAQ Section */}
      <FAQSection />
    </MainLayout>
  );
}
