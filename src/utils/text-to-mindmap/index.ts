/**
 * 将用户输入的文本转换为Mind-Elixir格式的JSON数据
 */
//zhehsi收到货发电机房
export interface MindElixirNode {
  topic: string;
  id: string;
  children?: MindElixirNode[];
}

export interface MindElixirData {
  nodeData: MindElixirNode;
  linkData?: unknown[];
}

/**
 * 将文本转换为Mind-Elixir数据格式
 * 支持单行文本和多行层级文本
 */
export function textToMindElixirData(input: string): MindElixirData {
  console.log('Converting text to MindElixir data:', input);

  const lines = input.split('\n').map(line => line.trim()).filter(Boolean);

  if (lines.length === 0) {
    return {
      nodeData: {
        topic: '空白思维导图',
        id: 'root',
        children: []
      }
    };
  }

  // 如果只有一行，创建简单的根节点，并添加一些默认子节点让思维导图更有意义
  if (lines.length === 1) {
    const result = {
      nodeData: {
        topic: lines[0],
        id: 'root',
        children: [
          {
            topic: '主要内容',
            id: 'node-1',
            children: []
          },
          {
            topic: '相关信息',
            id: 'node-2',
            children: []
          },
          {
            topic: '后续行动',
            id: 'node-3',
            children: []
          }
        ]
      }
    };
    console.log('Single line result:', result);
    return result;
  }

  // 多行文本处理
  const rootTopic = lines[0];
  const childLines = lines.slice(1);

  // 解析子节点
  const children = parseChildNodes(childLines);

  const result = {
    nodeData: {
      topic: rootTopic,
      id: 'root',
      children: children
    }
  };

  console.log('Multi-line result:', result);
  return result;
}

/**
 * 解析子节点（处理带缩进或符号的层级结构）
 */
function parseChildNodes(lines: string[]): MindElixirNode[] {
  const children: MindElixirNode[] = [];
  let nodeIdCounter = 1;

  for (const line of lines) {
    // 移除常见的列表符号和缩进
    const cleanedLine = line.replace(/^[-•*+]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();

    if (cleanedLine) {
      children.push({
        topic: cleanedLine,
        id: `node-${nodeIdCounter++}`,
        children: []
      });
    }
  }

  return children;
}

/**
 * 解析复杂的层级结构（支持多级缩进）
 * 这是一个更高级的解析函数，可以处理嵌套的层级结构
 */
export function parseHierarchicalText(input: string): MindElixirData {
  const lines = input.split('\n').filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      nodeData: {
        topic: '空白思维导图',
        id: 'root',
        children: []
      }
    };
  }

  // 第一行作为根节点
  const rootTopic = lines[0].trim();
  let nodeIdCounter = 1;

  // 解析层级结构
  const parseLevel = (startIndex: number, parentIndent: number): { nodes: MindElixirNode[], nextIndex: number } => {
    const nodes: MindElixirNode[] = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i];
      const indent = getIndentLevel(line);
      const content = line.trim().replace(/^[-•*+]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();

      if (indent < parentIndent) {
        // 缩进减少，返回上一级
        break;
      } else if (indent === parentIndent && content) {
        // 同级节点
        const node: MindElixirNode = {
          topic: content,
          id: `node-${nodeIdCounter++}`,
          children: []
        };

        // 检查是否有子节点
        if (i + 1 < lines.length && getIndentLevel(lines[i + 1]) > indent) {
          const result = parseLevel(i + 1, indent + 1);
          node.children = result.nodes;
          i = result.nextIndex - 1;
        }

        nodes.push(node);
      }

      i++;
    }

    return { nodes, nextIndex: i };
  };

  // 解析根节点的子节点
  // 找到第一个子节点的缩进级别作为基准
  let baseIndent = 0;
  if (lines.length > 1) {
    baseIndent = getIndentLevel(lines[1]);
  }

  const { nodes: children } = parseLevel(1, baseIndent);

  return {
    nodeData: {
      topic: rootTopic,
      id: 'root',
      children: children
    }
  };
}

/**
 * 计算行的缩进级别
 */
function getIndentLevel(line: string): number {
  let indent = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === ' ') {
      indent++;
    } else if (line[i] === '\t') {
      indent += 4; // 制表符算作4个空格
    } else {
      break;
    }
  }
  return Math.floor(indent / 2); // 每2个空格算一级缩进
}

/**
 * 智能文本解析 - 自动检测文本格式并选择合适的解析方式
 */
// 导入Markdown解析器
import { parseMarkdownToMindMap } from './markdown-parser';
// 导入混合格式解析器
import { parseMixedFormatText } from './mixed-format-parser';
// 导入智能大纲解析器
import { parseSmartOutlineText } from './smart-outline-parser';
import { parseSmartOutlineTextFixed } from './smart-outline-parser-fixed';
// 导入结构检测器
import { detectTextStructure, TextStructureType } from './structure-detector';
// 导入DOCX内容解析器
import { parseDocxContentText } from './docx-content-parser';
// 导入增强版树结构工具
import { parseTree, isTreeStructure } from './tree-utils';
// 导入PDF内容解析器
import { parsePdfContent } from './pdf-content-parser';

/**
 * 智能文本解析 - 自动检测文本格式并选择合适的解析方式
 */
export function smartTextParse(input: string): MindElixirData {
  const lines = input.split('\n').filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return textToMindElixirData('空白思维导图');
  }

  // 如果只有一行，使用简单处理
  if (lines.length === 1) {
    return textToMindElixirData(input);
  }

  // 首先尝试使用增强版树结构工具
  if (isTreeStructure(input)) {
    console.log('✅ 使用增强版树结构解析器');
    try {
      return parseTree(input);
    } catch (error) {
      console.log('❌ 增强版解析失败，回退到传统解析器:', error);
    }
  }

  // 检测文本结构类型
  const structureType = detectTextStructure(input);
  console.log('检测到的文本结构类型:', structureType);

  // 根据结构类型选择解析策略
  switch (structureType) {
    case TextStructureType.MARKDOWN:
      console.log('使用Markdown解析器');
      return parseMarkdownToMindMap(input);

    case TextStructureType.SMART_OUTLINE:
      console.log('🚀 使用修复版智能大纲解析器 (SMART_OUTLINE)');
      console.log('📝 输入文本预览:', input.substring(0, 100) + '...');
      const result = parseSmartOutlineTextFixed(input);
      console.log('✅ 解析器返回结果，根节点:', result.nodeData?.topic);
      return result;

    case TextStructureType.MIXED_FORMAT:
      console.log('使用混合格式解析器');
      return parseMixedFormatText(input);

    case TextStructureType.INDENTED:
    case TextStructureType.BULLET_LIST:
    case TextStructureType.NUMBERED_LIST:
    case TextStructureType.OUTLINE:
      console.log('使用层级结构解析器');
      return parseHierarchicalText(input);

    case TextStructureType.JSON:
      console.log('解析JSON结构');
      try {
        const jsonData = JSON.parse(input);
        return convertJsonToMindMap(jsonData);
      } catch (e) {
        console.error('JSON解析失败，回退到普通文本解析', e);
        return parseDocumentContent(input);
      }

    case TextStructureType.DOCX_CONTENT:
      console.log('🚀 检测到DOCX内容，使用专用解析器');
      const docxResult = parseDocxContentText(input);
      console.log('✅ DOCX解析器返回结果，根节点:', docxResult.nodeData?.topic);
      console.log('📊 根节点子节点数:', docxResult.nodeData?.children?.length || 0);
      return docxResult;

    case TextStructureType.YAML:
      console.log('检测到YAML格式，使用层级解析');
      return parseHierarchicalText(input);

    default:
      console.log('使用普通文本解析');
      return parseDocumentContent(input);
  }
}

/**
 * 将JSON对象转换为思维导图结构
 */
function convertJsonToMindMap(json: Record<string, unknown>, rootTitle: string = 'JSON数据'): MindElixirData {
  let nodeIdCounter = 1;

  // 递归处理JSON对象
  const processJsonNode = (data: unknown, parentId: string = 'root'): MindElixirNode[] => {
    const nodes: MindElixirNode[] = [];

    if (Array.isArray(data)) {
      // 处理数组
      data.forEach((item, index) => {
        const nodeId = `node-${nodeIdCounter++}`;

        if (typeof item === 'object' && item !== null) {
          // 复杂对象，创建子树
          const childNodes = processJsonNode(item, nodeId);
          nodes.push({
            id: nodeId,
            topic: `项目 ${index + 1}`,
            children: childNodes
          });
        } else {
          // 简单值，直接添加
          nodes.push({
            id: nodeId,
            topic: String(item),
            children: []
          });
        }
      });
    } else if (typeof data === 'object' && data !== null) {
      // 处理对象
      Object.entries(data).forEach(([key, value]) => {
        const nodeId = `node-${nodeIdCounter++}`;

        if (typeof value === 'object' && value !== null) {
          // 复杂对象，创建子树
          const childNodes = processJsonNode(value, nodeId);
          nodes.push({
            id: nodeId,
            topic: key,
            children: childNodes
          });
        } else {
          // 简单键值对，直接添加
          nodes.push({
            id: nodeId,
            topic: `${key}: ${value}`,
            children: []
          });
        }
      });
    }

    return nodes;
  };

  // 创建根节点
  const rootNode: MindElixirNode = {
    id: 'root',
    topic: rootTitle,
    children: processJsonNode(json)
  };

  return { nodeData: rootNode };
}

/**
 * 解析文档内容为思维导图
 * 专门处理复杂的文档内容，如PDF解析结果
 */
function parseDocumentContent(input: string): MindElixirData {
  console.log('解析文档内容:', input.substring(0, 200));

  const lines = input.split('\n').filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return textToMindElixirData('空白思维导图');
  }

  // 使用第一行作为根节点，如果第一行太长则截取
  const rootTopic = lines[0].length > 50 ? lines[0].slice(0, 50) + '...' : lines[0];

  const children: MindElixirNode[] = [];
  let nodeIdCounter = 1;

  // 定义主要分类
  const categories = {
    '组件架构': [] as string[],
    '下拉刷新': [] as string[],
    '埋点': [] as string[],
    '车图': [] as string[],
    '接口': [] as string[],
    '配置': [] as string[],
    '其他': [] as string[]
  };

  // 对内容进行分类
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 2) continue;

    console.log('正在分类行:', line);

    // 根据关键词进行分类
    if (line.includes('Controller') || line.includes('View') || line.includes('Cell') || line.includes('Host') ||
      line.includes('组件') || line.includes('视图') || line.includes('Container') || line.includes('Provider')) {
      categories['组件架构'].push(line);
      console.log('分类到组件架构:', line);
    } else if (line.includes('下拉刷新') || line.includes('刷新') || line.includes('refresh') || line.includes('reload') ||
      line.includes('notifyContentToRefresh') || line.includes('refreshIfNeeded') || line.includes('Refresh')) {
      categories['下拉刷新'].push(line);
      console.log('分类到下拉刷新:', line);
    } else if (line.includes('埋点') || line.includes('track') || line.includes('report') || line.includes('曝光') ||
      line.includes('MPVehicle.report') || line.includes('CarControlExpo') || line.includes('Expo')) {
      categories['埋点'].push(line);
      console.log('分类到埋点:', line);
    } else if (line.includes('车图') || line.includes('2D') || line.includes('3D') ||
      line.includes('New2DVehicleView') || line.includes('Flexi3DVehicleView') || line.includes('VehicleView')) {
      categories['车图'].push(line);
      console.log('分类到车图:', line);
    } else if (line.includes('接口') || line.includes('api') || line.includes('http') || line.includes('.com') ||
      line.includes('/app/') || line.includes('/api/') || line.includes('/icar/') || line.includes('/function/') ||
      line.includes('config') || line.includes('v2')) {
      categories['接口'].push(line);
      console.log('分类到接口:', line);
    } else if (line.includes('配置') || line.includes('config') || line.includes('设置') || line.includes('参数') ||
      line.includes('Config') || line.includes('Setting')) {
      categories['配置'].push(line);
      console.log('分类到配置:', line);
    } else {
      categories['其他'].push(line);
      console.log('分类到其他:', line);
    }
  }

  console.log('分类结果:', Object.entries(categories).map(([key, value]) => `${key}: ${value.length}项`));

  // 创建分类节点
  Object.entries(categories).forEach(([categoryName, items]) => {
    if (items.length > 0) {
      // 限制每个分类下的项目数量，避免过于冗长
      const maxItems = 15;
      const displayItems = items.slice(0, maxItems);

      const categoryNode: MindElixirNode = {
        topic: categoryName,
        id: `node-${nodeIdCounter++}`,
        children: displayItems.map(item => {
          // 限制每个项目的长度
          const displayText = item.length > 100 ? item.slice(0, 100) + '...' : item;
          return {
            topic: displayText,
            id: `node-${nodeIdCounter++}`,
            children: []
          };
        })
      };

      // 如果有更多项目，添加一个提示节点
      if (items.length > maxItems) {
        categoryNode.children!.push({
          topic: `... 还有 ${items.length - maxItems} 个项目`,
          id: `node-${nodeIdCounter++}`,
          children: []
        });
      }

      children.push(categoryNode);
    }
  });

  // 如果没有找到任何分类内容，使用原来的简单分组方式
  if (children.length === 0) {
    console.log('没有找到分类内容，使用简单分组');
    const chunks = chunkLines(lines.slice(1), 10);
    chunks.forEach((chunk, index) => {
      if (chunk.length > 0) {
        children.push({
          topic: `部分 ${index + 1}`,
          id: `node-${nodeIdCounter++}`,
          children: chunk.map(line => ({
            topic: line.length > 100 ? line.slice(0, 100) + '...' : line,
            id: `node-${nodeIdCounter++}`,
            children: []
          }))
        });
      }
    });
  }

  const result = {
    nodeData: {
      topic: rootTopic,
      id: 'root',
      children: children
    }
  };

  console.log('最终思维导图结果:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * 判断一行内容是否是重要内容（如标题、关键词等）
 */
function isImportantContent(line: string): boolean {
  // 检查是否是明显的标题模式
  if (line.length <= 20 && !line.includes('：') && !line.includes(':') && !line.includes('，')) {
    return true;
  }

  // 检查是否包含关键词
  const keywords = ['埋点', '接口', '车图', '刷新', '首页', '车辆', '状态', '控制', '组件', '视图', '管理', '数据', '服务'];
  if (keywords.some(keyword => line.includes(keyword))) {
    return true;
  }

  // 检查是否是代码或技术术语
  if (line.includes('Controller') || line.includes('View') || line.includes('Cell') || line.includes('Host')) {
    return true;
  }

  return false;
}

/**
 * 查找与当前行相关的内容
 */
function findRelatedContent(lines: string[], currentIndex: number): string[] {
  const relatedContent: string[] = [];
  const currentLine = lines[currentIndex].trim();

  // 向后查找相关内容（最多查找5行）
  for (let i = currentIndex + 1; i < Math.min(currentIndex + 6, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length < 2) continue;

    // 如果遇到另一个重要内容，停止查找
    if (isImportantContent(line)) {
      break;
    }

    // 如果行长度适中，添加为相关内容
    if (line.length > 2 && line.length <= 100) {
      relatedContent.push(line);
    }
  }

  return relatedContent;
}

/**
 * 将行分组
 */
function chunkLines(lines: string[], chunkSize: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 示例数据生成器
 */
export function generateSampleMindElixirData(): MindElixirData {
  return {
    nodeData: {
      topic: '示例思维导图',
      id: 'root',
      children: [
        {
          topic: '第一个分支',
          id: 'node-1',
          children: [
            { topic: '子项目 1', id: 'node-1-1', children: [] },
            { topic: '子项目 2', id: 'node-1-2', children: [] }
          ]
        },
        {
          topic: '第二个分支',
          id: 'node-2',
          children: [
            { topic: '子项目 A', id: 'node-2-1', children: [] },
            { topic: '子项目 B', id: 'node-2-2', children: [] }
          ]
        },
        {
          topic: '第三个分支',
          id: 'node-3',
          children: []
        }
      ]
    }
  };
}

/**
 * 使用Gemini AI智能解析文本并生成思维导图
 * 适用于需要语义理解的复杂文档结构
 */
export async function aiSmartTextParse(input: string): Promise<MindElixirData> {
  console.log('Using AI smart text parsing:', input.substring(0, 200));

  try {
    // 动态导入Gemini服务（避免SSR问题）
    const { geminiService } = await import('@/lib/ai/gemini-client');

    // 使用Gemini API进行智能解析
    const result = await geminiService.structureTextToMindMap(input);

    console.log('AI parsing result:', result);
    return result;

  } catch (error) {
    console.error('AI parsing failed, falling back to local parsing:', error);

    // 如果AI解析失败，回退到本地智能解析
    return smartTextParse(input);
  }
}