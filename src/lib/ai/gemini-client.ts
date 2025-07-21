/**
 * Gemini API 客户端
 * 用于处理文本结构化，生成Mind-Elixir格式的JSON数据
 */

import type { MindElixirData } from '@/utils/text-to-mindmap';

// Gemini API 配置
const GEMINI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_API_KEY = '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';

// Gemini API 响应接口
interface GeminiResponse {
  id: string;
  provider: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    logprobs: null;
    finish_reason: string;
    native_finish_reason: string;
    index: number;
    message: {
      role: string;
      content: string;
      refusal: null;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Gemini 客户端服务
 */
export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.apiUrl = GEMINI_API_URL;
  }

  /**
   * 调用 Gemini API
   */
  private async callAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-pro',
          messages: messages,
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Gemini API returned no choices');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  /**
   * 将文本内容结构化为思维导图JSON
   */
  async structureTextToMindMap(content: string): Promise<MindElixirData> {
    const systemPrompt = `你是一个专业的思维导图结构分析师。你的任务是将文本内容转换为思维导图JSON格式。

**重要：你必须始终返回有效的JSON格式，即使遇到任何错误或问题。**

要求：
1. 分析文本的逻辑层次关系，正确识别主题、章节、子主题的层级关系
2. 理解语义上的包含关系，比如"项目背景"应该是"项目概述"的子节点
3. 提取关键信息，去除冗余内容
4. **无论如何都要返回有效的JSON格式**

JSON格式要求：
{
  "nodeData": {
    "topic": "根节点标题",
    "id": "root",
    "children": [
      {
        "topic": "主题1",
        "id": "node-1",
        "children": [
          {
            "topic": "子主题1.1",
            "id": "node-1-1",
            "children": []
          }
        ]
      }
    ]
  }
}

严格规则：
- 每个节点必须有topic、id、children三个字段
- id需要是唯一的，使用node-数字格式
- children即使为空也必须是数组[]
- topic内容要简洁明了，避免过长
- 最多生成3-4层层级
- **如果文本内容无法解析，返回包含错误信息的有效JSON结构**
- **绝对不要返回解释文字，只返回JSON**

错误情况的JSON示例：
{
  "nodeData": {
    "topic": "解析结果",
    "id": "root",
    "children": [
      {
        "topic": "内容无法解析",
        "id": "node-1",
        "children": []
      }
    ]
  }
}`;

    const userPrompt = `请分析以下文本内容，生成思维导图JSON结构：

${content}`;

    try {
      const response = await this.callAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // 多层次JSON解析策略
      let mindMapData: MindElixirData | null = null;
      let jsonStr = response.trim();

      // 策略1: 直接解析
      try {
        mindMapData = JSON.parse(jsonStr);
      } catch {
        // 策略2: 提取代码块中的JSON
        if (jsonStr.includes('```')) {
          const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (jsonMatch) {
            try {
              mindMapData = JSON.parse(jsonMatch[1]);
            } catch {
              console.warn('Failed to parse JSON from code block');
            }
          }
        }

        // 策略3: 查找第一个完整的JSON对象
        if (!mindMapData) {
          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              mindMapData = JSON.parse(jsonMatch[0]);
            } catch {
              console.warn('Failed to parse extracted JSON object');
            }
          }
        }
      }

      // 验证和修复JSON结构
      if (mindMapData && this.validateAndFixMindMapData(mindMapData)) {
        console.log('Gemini generated valid mindmap:', mindMapData);
        return mindMapData;
      }

      console.warn('Gemini returned invalid JSON, using fallback');
      return this.createFallbackMindMap(content);

    } catch (error) {
      console.error('Error structuring text with Gemini:', error);
      return this.createFallbackMindMap(content);
    }
  }

  /**
   * 验证和修复思维导图数据结构
   */
  private validateAndFixMindMapData(data: any): boolean {
    try {
      // 检查基本结构
      if (!data || typeof data !== 'object') return false;
      if (!data.nodeData || typeof data.nodeData !== 'object') return false;

      const nodeData = data.nodeData;

      // 修复根节点
      if (!nodeData.topic || typeof nodeData.topic !== 'string') {
        nodeData.topic = '文档分析';
      }
      if (!nodeData.id || typeof nodeData.id !== 'string') {
        nodeData.id = 'root';
      }
      if (!Array.isArray(nodeData.children)) {
        nodeData.children = [];
      }

      // 递归修复子节点
      this.fixNodeStructure(nodeData);

      return true;
    } catch (error) {
      console.error('Error validating mindmap data:', error);
      return false;
    }
  }

  /**
   * 递归修复节点结构
   */
  private fixNodeStructure(node: any, depth: number = 0): void {
    if (!node || typeof node !== 'object') return;

    // 限制深度，避免无限递归
    if (depth > 5) return;

    // 确保必要字段存在
    if (!node.topic || typeof node.topic !== 'string') {
      node.topic = `节点${Math.floor(Math.random() * 1000)}`;
    }
    if (!node.id || typeof node.id !== 'string') {
      node.id = `node-${depth}-${Math.floor(Math.random() * 1000)}`;
    }
    if (!Array.isArray(node.children)) {
      node.children = [];
    }

    // 递归处理子节点
    node.children.forEach((child: any, index: number) => {
      this.fixNodeStructure(child, depth + 1);
    });
  }

  /**
   * 创建回退的思维导图结构
   */
  private createFallbackMindMap(content: string): MindElixirData {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    let rootTopic = '文档分析';
    const children: { topic: string; id: string; children?: unknown[] }[] = [];
    let nodeId = 1;

    // 如果第一行看起来像标题，使用它作为根节点
    if (lines.length > 0 && lines[0].length < 50) {
      rootTopic = lines[0].trim();
      lines.shift();
    }

    // 简单的章节识别
    const chapters: { [key: string]: string[] } = {};
    let currentChapter = '主要内容';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 识别章节标题（包含"第"、"章"、数字开头等）
      if (trimmedLine.match(/^(第.{1,10}[章节]|[0-9]+[\.\s]|\d+\.\d+)/)) {
        currentChapter = trimmedLine.length > 30 ? trimmedLine.substring(0, 30) + '...' : trimmedLine;
        if (!chapters[currentChapter]) {
          chapters[currentChapter] = [];
        }
      } else if (trimmedLine.length > 5) {
        if (!chapters[currentChapter]) {
          chapters[currentChapter] = [];
        }
        chapters[currentChapter].push(trimmedLine);
      }
    }

    // 生成子节点
    for (const [chapterTitle, chapterContent] of Object.entries(chapters)) {
      if (chapterContent.length > 0) {
        children.push({
          topic: chapterTitle,
          id: `node-${nodeId++}`,
          children: chapterContent.slice(0, 5).map(content => ({
            topic: content.length > 50 ? content.substring(0, 50) + '...' : content,
            id: `node-${nodeId++}`,
            children: []
          }))
        });
      }
    }

    // 如果没有识别到章节，创建默认结构
    if (children.length === 0) {
      const chunks = [];
      for (let i = 0; i < lines.length; i += 3) {
        chunks.push(lines.slice(i, i + 3));
      }

      children.push(...chunks.slice(0, 6).map((chunk, index) => ({
        topic: `部分 ${index + 1}`,
        id: `node-${nodeId++}`,
        children: chunk.map(line => ({
          topic: line.length > 50 ? line.substring(0, 50) + '...' : line,
          id: `node-${nodeId++}`,
          children: []
        }))
      })));
    }

    return {
      nodeData: {
        topic: rootTopic,
        id: 'root',
        children
      }
    };
  }

  /**
   * 测试 Gemini API 连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.callAPI([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, please reply with "OK" to test the connection.' }
      ]);
      return true;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

// 导出单例实例
export const geminiService = new GeminiService();