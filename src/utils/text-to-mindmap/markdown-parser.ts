/**
 * Markdown解析器 - 将Markdown文本转换为Mind-Elixir格式的思维导图
 */

import type { MindElixirData, MindElixirNode } from './index';

/**
 * 将Markdown文本解析为Mind-Elixir格式的思维导图数据
 * 专门处理Markdown的标题层级结构
 */
export function parseMarkdownToMindMap(markdown: string): MindElixirData {
  console.log('使用专用Markdown解析器处理文本');
  
  // 预处理Markdown文本
  // 移除代码块，避免干扰解析
  markdown = markdown.replace(/```[\s\S]*?```/g, '');
  
  // 按行分割并保留空行（用于分段）
  const lines = markdown.split('\n');
  
  if (lines.filter(Boolean).length === 0) {
    return {
      nodeData: {
        topic: '空白思维导图',
        id: 'root',
        children: []
      }
    };
  }

  // 查找第一个标题作为根节点
  let rootTitle = '';
  let startIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const headingMatch = lines[i].trim().match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      rootTitle = headingMatch[2].trim();
      startIndex = i + 1;
      break;
    }
  }
  
  // 如果没有找到标题，使用第一行非空内容作为标题
  if (!rootTitle) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        rootTitle = lines[i].trim();
        startIndex = i + 1;
        break;
      }
    }
  }
  
  // 如果仍然没有标题，使用默认标题
  if (!rootTitle) {
    rootTitle = '思维导图';
  }
  
  // 创建根节点
  const rootNode: MindElixirNode = {
    topic: rootTitle,
    id: 'root',
    children: []
  };

  // 解析剩余行并构建树结构
  const nodeStack: { node: MindElixirNode, level: number }[] = [{ node: rootNode, level: 0 }];
  let nodeIdCounter = 1;
  
  // 用于跟踪当前处理的标题级别
  let currentHeadingLevel = 0;
  
  // 从标题后的第一行开始解析
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 跳过空行
    
    // 检测标题级别 (# 一级标题, ## 二级标题, 等)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      // 这是一个标题行
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      
      // 创建新节点
      const newNode: MindElixirNode = {
        topic: title,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      
      // 根据标题级别找到合适的父节点
      while (nodeStack.length > 1 && nodeStack[nodeStack.length - 1].level >= level) {
        nodeStack.pop();
      }
      
      // 添加到父节点的子节点列表
      const parentNode = nodeStack[nodeStack.length - 1].node;
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(newNode);
      
      // 将新节点添加到节点堆栈
      nodeStack.push({ node: newNode, level });
      currentHeadingLevel = level;
    } else {
      // 非标题行，检查是否是列表项
      const listItemMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
      const numberedListMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
      
      if (listItemMatch || numberedListMatch) {
        // 这是一个列表项
        const match = listItemMatch || numberedListMatch;
        const indent = match![1].length;
        const content = match![2].trim();
        
        // 计算列表项的级别（基于缩进）
        // 每个缩进级别相当于标题级别+1
        const listLevel = currentHeadingLevel + 1 + Math.floor(indent / 2);
        
        // 创建列表项节点
        const listItemNode: MindElixirNode = {
          topic: content,
          id: `node-${nodeIdCounter++}`,
          children: []
        };
        
        // 找到合适的父节点
        while (nodeStack.length > 1 && nodeStack[nodeStack.length - 1].level >= listLevel) {
          nodeStack.pop();
        }
        
        // 添加到父节点
        const parentNode = nodeStack[nodeStack.length - 1].node;
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(listItemNode);
        
        // 将列表项添加到节点堆栈
        nodeStack.push({ node: listItemNode, level: listLevel });
      } else {
        // 处理其他Markdown元素
        let content = line;
        
        // 处理链接 [text](url)
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
        
        // 处理粗体 **text** 或 __text__
        content = content.replace(/(\*\*|__)(.*?)\1/g, '$2');
        
        // 处理斜体 *text* 或 _text_
        content = content.replace(/(\*|_)(.*?)\1/g, '$2');
        
        // 如果内容太长，截断显示
        content = content.length > 80 ? content.substring(0, 80) + '...' : content;
        
        // 段落级别比当前标题高一级
        const paragraphLevel = currentHeadingLevel + 1;
        
        // 找到合适的父节点（回到标题级别）
        while (nodeStack.length > 1 && nodeStack[nodeStack.length - 1].level > currentHeadingLevel) {
          nodeStack.pop();
        }
        
        const paragraphNode: MindElixirNode = {
          topic: content,
          id: `node-${nodeIdCounter++}`,
          children: []
        };
        
        // 添加到当前标题节点
        const currentNode = nodeStack[nodeStack.length - 1].node;
        if (!currentNode.children) {
          currentNode.children = [];
        }
        currentNode.children.push(paragraphNode);
      }
    }
  }

  // 添加调试日志
  console.log('Markdown解析结果:', JSON.stringify(rootNode, null, 2));
  
  return { nodeData: rootNode };
}