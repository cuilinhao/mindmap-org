import { type NextRequest, NextResponse } from 'next/server';
import { parseDocumentByType, parseTextContent, validateFileForParsing } from '@/utils/document-parser';
import { smartTextParse, aiSmartTextParse } from '@/utils/text-to-mindmap';
import type {
  ApiResponse,
  DocumentContent
} from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 确保所有响应都是JSON格式的包装函数
  const createJsonResponse = (data: any, status: number = 200): NextResponse => {
    return new NextResponse(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      }
    });
  };

  // 错误响应包装函数
  const createErrorResponse = (message: string, code: string, status: number = 500): NextResponse => {
    return createJsonResponse({
      success: false,
      error: { message, code },
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: 0
      }
    } as ApiResponse, status);
  };

  try {
    const startTime = Date.now();

    // 检查请求大小
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 9 * 1024 * 1024) { // 9MB
      return createErrorResponse(
        '文件过大，请选择小于9MB的文件',
        'FILE_TOO_LARGE',
        413
      );
    }

    // 解析请求数据
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('解析表单数据失败:', formError);

      // 检查是否是文件过大导致的错误
      if (formError instanceof Error && formError.message.includes('size')) {
        return createErrorResponse(
          '文件过大，请选择小于9MB的文件',
          'FILE_TOO_LARGE',
          413
        );
      }

      return createErrorResponse(
        '解析请求数据失败',
        'INVALID_REQUEST',
        400
      );
    }

    const type = formData.get('type') as 'file_upload' | 'text_input';
    const title = formData.get('title') as string;

    let textContent: string;

    if (type === 'file_upload') {
      // 处理文件上传 - 先提取文本内容
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({
          success: false,
          error: {
            message: '没有提供文件',
            code: 'NO_FILE'
          }
        } as ApiResponse, { status: 400 });
      }

      // 验证文件大小
      if (file.size > 9 * 1024 * 1024) { // 9MB
        return createErrorResponse(
          '文件过大，请选择小于9MB的文件',
          'FILE_TOO_LARGE',
          413
        );
      }

      // 验证文件
      const validation = validateFileForParsing(file);
      if (!validation.valid) {
        return NextResponse.json({
          success: false,
          error: {
            message: validation.error || '文件验证失败',
            code: 'INVALID_FILE'
          }
        } as ApiResponse, { status: 400 });
      }

      // 解析文件并提取文本
      let buffer;
      try {
        buffer = Buffer.from(await file.arrayBuffer());
      } catch (bufferError) {
        console.error('创建文件缓冲区失败:', bufferError);
        return NextResponse.json({
          success: false,
          error: {
            message: '文件处理失败',
            code: 'FILE_BUFFER_ERROR'
          }
        } as ApiResponse, { status: 400 });
      }

      let parseResult;

      try {
        // 使用通用解析处理所有文件类型，包括PDF
        parseResult = await parseDocumentByType(buffer, file.type, file.name);

        if (!parseResult.success) {
          return NextResponse.json({
            success: false,
            error: {
              message: parseResult.error || '文件解析失败',
              code: parseResult.errorCode || 'PARSE_FAILED'
            }
          } as ApiResponse, { status: 400 });
        }
      } catch (error) {
        console.error('文件解析出错:', error);

        // 获取错误代码（如果有）
        const errorCode = (error as any)?.code || 'PARSE_FAILED';
        const errorMessage = error instanceof Error ? error.message : '文件解析失败';

        return NextResponse.json({
          success: false,
          error: {
            message: errorMessage,
            code: errorCode
          }
        } as ApiResponse, { status: 400 });
      }

      textContent = parseResult.content?.originalText || '';
    } else {
      // 处理文本输入
      const inputText = formData.get('content') as string;

      if (!inputText || inputText.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: {
            message: '没有提供文本内容',
            code: 'NO_CONTENT'
          }
        } as ApiResponse, { status: 400 });
      }

      if (inputText.length > 50000) {
        return NextResponse.json({
          success: false,
          error: {
            message: '文本内容过长，请控制在50000字符以内',
            code: 'CONTENT_TOO_LONG'
          }
        } as ApiResponse, { status: 400 });
      }

      textContent = inputText;
    }

    // 判断是否使用AI解析
    let mindMapData;
    let shouldUseAI = false;

    // 对于文本输入，使用AI解析
    if (type === 'text_input') {
      shouldUseAI = true;
    }
    // 对于文件上传，根据文件类型决定
    else if (type === 'file_upload') {
      const file = formData.get('file') as File;
      const fileType = file.type;

      // PPT文件不使用AI，直接本地解析
      const isPptFile = fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        fileType === 'application/vnd.ms-powerpoint';

      // 检查文本内容是否具有明显的结构特征
      const hasStructure = (() => {
        // 检查是否有明显的章节标题
        const hasChapterTitles = textContent.split('\n')
          .some(line => /^(第[一二三四五六七八九十\d]+[章节]|[一二三四五六七八九十]+[、\s]|Chapter\s+\d+|Section\s+\d+)/i.test(line.trim()));

        // 检查是否有编号列表
        const hasNumberedList = textContent.split('\n')
          .some(line => /^\d+[\.\)]\s/.test(line.trim()));

        // 检查是否有列表标记
        const hasListMarkers = textContent.split('\n')
          .some(line => /^[-•*+]\s/.test(line.trim()));

        // 检查是否有课程/培训类结构
        const hasCourseStructure = textContent.split('\n')
          .some(line => /^(探索|学习|掌握|了解|深入|实操|创意|原型|成果)/.test(line.trim()) ||
            /基础知识$/.test(line.trim()) ||
            /路线图$/.test(line.trim()) ||
            /实践$/.test(line.trim()) ||
            /演练$/.test(line.trim()) ||
            /实战$/.test(line.trim()) ||
            /展现$/.test(line.trim()));

        return hasChapterTitles || hasNumberedList || hasListMarkers || hasCourseStructure;
      })();

      // 对于TXT、DOC文件，如果没有明显结构特征，使用AI解析
      shouldUseAI = !isPptFile && !hasStructure;

      console.log(`文件类型: ${fileType}, 是否有结构: ${hasStructure}, 是否使用AI: ${shouldUseAI}`);
    }

    // 处理文件解析
    try {
      if (type === 'file_upload') {
        const file = formData.get('file') as File;
        if (shouldUseAI) {
          console.log('使用Gemini AI解析文本...');
          try {
            mindMapData = await aiSmartTextParse(textContent);
          } catch (aiError) {
            console.error('AI解析失败，回退到本地解析:', aiError);
            // 如果AI解析失败，回退到本地解析
            mindMapData = smartTextParse(textContent);
          }
        } else {
          console.log('使用本地智能解析...');
          mindMapData = smartTextParse(textContent);
        }
      } else if (shouldUseAI) {
        console.log('使用Gemini AI解析文本...');
        try {
          mindMapData = await aiSmartTextParse(textContent);
        } catch (aiError) {
          console.error('AI解析失败，回退到本地解析:', aiError);
          // 如果AI解析失败，回退到本地解析
          mindMapData = smartTextParse(textContent);
        }
      } else {
        console.log('使用本地智能解析...');
        mindMapData = smartTextParse(textContent);
      }

      // 验证生成的思维导图数据
      if (!mindMapData || !mindMapData.nodeData) {
        console.error('生成的思维导图数据无效，使用默认数据');
        // 提供一个默认的思维导图结构
        mindMapData = {
          nodeData: {
            topic: '解析结果',
            id: 'root',
            children: [
              {
                topic: '无法解析文档',
                id: 'error-node',
                children: []
              }
            ]
          }
        };
      }
    } catch (parseError) {
      console.error('思维导图生成过程中出错:', parseError);
      // 提供一个错误信息的思维导图
      mindMapData = {
        nodeData: {
          topic: '解析错误',
          id: 'root',
          children: [
            {
              topic: '文档解析失败',
              id: 'error-node',
              children: [
                {
                  topic: parseError instanceof Error ? parseError.message : '未知错误',
                  id: 'error-details',
                  children: []
                }
              ]
            }
          ]
        }
      };
    }

    const processingTime = Date.now() - startTime;

    // 使用统一的JSON响应函数
    return createJsonResponse({
      success: true,
      data: mindMapData,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime
      }
    } as ApiResponse<typeof mindMapData>);

  } catch (error) {
    console.error('API Error:', error);

    // 检查是否是自定义错误代码
    const errorCode = (error as any)?.code || 'INTERNAL_ERROR';
    const errorMessage = error instanceof Error ? error.message : '服务器内部错误';

    // 始终返回JSON格式的错误响应
    return createErrorResponse(errorMessage, errorCode, 500);
  }
}

