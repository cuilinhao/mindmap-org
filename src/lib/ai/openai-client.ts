import OpenAI from 'openai';
import { appConfig } from '@/lib/config/app';

// 检查OpenAI配置
export const checkOpenAIConfig = () => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not found, using mock data mode');
    return false;
  }
  return true;
};

// 创建OpenAI客户端实例
export const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30秒超时
      maxRetries: 2, // 最多重试2次
    })
  : null;

// 预定义的提示词模板
export const promptTemplates = {
  topicSummary: {
    zh: `你是一个专业的内容分析师。请为以下文本段落生成一个简洁的主题标题（10字以内）和概要摘要（30字以内）。

要求：
1. 标题要准确概括核心主题
2. 摘要要突出关键要点
3. 语言要简洁明了
4. 保持中文表达习惯

文本内容：
{content}

请按以下格式回复：
标题：[主题标题]
摘要：[概要摘要]`,

    en: `You are a professional content analyst. Please generate a concise topic title (within 10 words) and summary (within 30 words) for the following text paragraphs.

Requirements:
1. Title should accurately summarize the core topic
2. Summary should highlight key points
3. Language should be clear and concise
4. Maintain natural English expression

Text content:
{content}

Please reply in the following format:
Title: [Topic Title]
Summary: [Summary]`
  },

  documentTitle: {
    zh: `请为以下文档内容生成一个简洁的标题（15字以内）：

{content}

标题：`,

    en: `Please generate a concise title (within 15 words) for the following document content:

{content}

Title:`
  }
};

// 模拟数据生成器
class MockAIService {
  /**
   * 生成模拟的嵌入向量
   */
  generateMockEmbeddings(texts: string[]): {
    embeddings: number[][];
    totalTokens: number;
  } {
    // 确保至少有一个文本段落
    const validTexts = texts.length > 0 ? texts : ['默认文本内容'];
    
    const embeddings = validTexts.map(() => {
      // 生成1536维的随机向量（text-embedding-3-small的维度）
      return Array.from({ length: 1536 }, () => Math.random() - 0.5);
    });
    
    const totalTokens = validTexts.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0);
    
    return { embeddings, totalTokens };
  }

  /**
   * 生成模拟的主题摘要
   */
  generateMockTopicSummary(
    paragraphs: string[],
    language: 'zh' | 'en' = 'zh'
  ): {
    title: string;
    summary: string;
  } {
    const combinedText = paragraphs.join('').trim();
    
    // 直接使用用户输入的内容作为主题
    let title: string;
    if (combinedText.length > 0) {
      // 取前6个字符作为主题标题
      title = combinedText.length <= 6 ? combinedText : combinedText.slice(0, 6);
    } else {
      title = language === 'zh' ? '未知主题' : 'Unknown Topic';
    }
    
    const summary = language === 'zh'
      ? `关于"${combinedText.slice(0, 20)}"的内容分析`
      : `Content analysis about "${combinedText.slice(0, 20)}"`;
    
    return { title, summary };
  }
}

// OpenAI API调用封装
export class OpenAIService {
  private client: OpenAI | null;
  private mockService: MockAIService;
  private isUsingMockData: boolean;

  constructor() {
    this.client = openai;
    this.mockService = new MockAIService();
    this.isUsingMockData = !checkOpenAIConfig();
    
    if (this.isUsingMockData) {
      console.log('🤖 AI Service running in mock mode (no OpenAI API key)');
    }
  }

  /**
   * 生成文本嵌入向量
   */
  async generateEmbeddings(texts: string[]): Promise<{
    embeddings: number[][];
    totalTokens: number;
  }> {
    // 过滤空文本并确保至少有一个有效文本
    const validTexts = texts.filter(text => text && text.trim().length > 0);
    if (validTexts.length === 0) {
      console.log('No valid texts provided, using default text');
      validTexts.push('默认文本内容');
    }

    if (this.isUsingMockData || !this.client) {
      console.log('Using mock embeddings for', validTexts.length, 'texts');
      return this.mockService.generateMockEmbeddings(validTexts);
    }

    try {
      const response = await this.client.embeddings.create({
        model: appConfig.aiConfig.embeddingModel,
        input: validTexts,
        encoding_format: 'float',
      });

      const embeddings = response.data.map(item => item.embedding);
      const totalTokens = response.usage.total_tokens;

      return { embeddings, totalTokens };
    } catch (error) {
      console.error('Error generating embeddings:', error);
      console.log('Falling back to mock embeddings');
      return this.mockService.generateMockEmbeddings(validTexts);
    }
  }

  /**
   * 为聚类生成主题摘要
   */
  async generateTopicSummary(
    paragraphs: string[],
    language: 'zh' | 'en' = 'zh'
  ): Promise<{
    title: string;
    summary: string;
  }> {
    if (this.isUsingMockData || !this.client) {
      console.log('Using mock topic summary for', paragraphs.length, 'paragraphs');
      return this.mockService.generateMockTopicSummary(paragraphs, language);
    }

    try {
      // 合并文本内容，每段用换行分隔
      const combinedText = paragraphs.join('\n').slice(0, 2000);
      
      // 根据用户提供的规范构建请求
      const response = await this.client.chat.completions.create({
        model: 'gpt-4', // 使用标准的 gpt-4 模型名称
        messages: [
          {
            role: 'system',
            content: '你是思维导图主题提炼专家。请用6词以内总结用户提供的内容主题。'
          },
          {
            role: 'user',
            content: combinedText
          }
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      const result = response.choices[0]?.message?.content?.trim() || '';

      // 返回生成的主题作为标题，简化处理
      const title = result || `主题${Math.floor(Math.random() * 1000)}`;
      const summary = `基于${paragraphs.length}个段落的主题分析`;

      return { title, summary };
    } catch (error) {
      console.error('Error generating topic summary:', error);
      console.log('Falling back to mock topic summary');
      return this.mockService.generateMockTopicSummary(paragraphs, language);
    }
  }

  /**
   * 生成文档标题
   */
  async generateDocumentTitle(
    content: string,
    language: 'zh' | 'en' = 'zh'
  ): Promise<string> {
    if (this.isUsingMockData || !this.client) {
      // 直接使用用户输入内容的前部分作为标题
      const trimmedContent = content.trim();
      if (trimmedContent.length <= 15) {
        return trimmedContent;
      }
      return `${trimmedContent.slice(0, 15)}...`;
    }

    try {
      const truncatedContent = content.slice(0, 1000);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: language === 'zh' 
              ? '请为以下文档内容生成一个简洁的标题（15字以内）' 
              : 'Please generate a concise title (within 15 words) for the following document content'
          },
          {
            role: 'user',
            content: truncatedContent
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      });

      const title = response.choices[0]?.message?.content?.trim() || '未命名文档';

      // 清理标题格式
      return title.replace(/^(标题[：:]?\s*|Title[：:]?\s*)/i, '').trim();
    } catch (error) {
      console.error('Error generating document title:', error);
      // 回退方案：直接使用内容前部分
      const trimmedContent = content.trim();
      if (trimmedContent.length <= 15) {
        return trimmedContent;
      }
      return `${trimmedContent.slice(0, 15)}...`;
    }
  }

  /**
   * 检测文本语言
   */
  async detectLanguage(text: string): Promise<'zh' | 'en' | 'auto'> {
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
   * 测试API连接
   */
  async testConnection(): Promise<boolean> {
    if (this.isUsingMockData || !this.client) {
      return true; // 模拟模式总是"连接成功"
    }

    try {
      await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'test',
      });
      return true;
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      return false;
    }
  }
}

// 导出单例实例
export const openaiService = new OpenAIService();
