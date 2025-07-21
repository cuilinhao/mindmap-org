/**
 * 通用PDF内容解析器 - 不依赖硬编码关键词，适用于任何PDF文档
 */

import { MindElixirData, MindElixirNode } from './index';

/**
 * 通用PDF内容解析函数
 */
export function parseUniversalPdfContent(input: string): MindElixirData {
  console.log('🔍 使用通用PDF内容解析器');
  
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

  // 使用第一行作为根节点标题
  const title = lines[0];
  console.log('📋 根节点标题:', title);

  // 通用结构分析
  const structure = analyzeUniversalTextStructure(lines);
  console.log('📊 结构分析结果:', structure);

  // 构建思维导图
  let nodeIdCounter = 1;
  const children: MindElixirNode[] = [];

  // 根据分析结果构建节点
  structure.sections.forEach(section => {
    const sectionNode: MindElixirNode = {
      topic: section.title,
      id: `node-${nodeIdCounter++}`,
      children: []
    };
    
    // 添加子内容
    section.items.forEach(item => {
      sectionNode.children!.push({
        topic: item,
        id: `node-${nodeIdCounter++}`,
        children: []
      });
    });
    
    children.push(sectionNode);
  });

  return {
    nodeData: {
      topic: title,
      id: 'root',
      children
    }
  };
}

/**
 * 通用文本结构分析 - 不依赖特定关键词
 */
function analyzeUniversalTextStructure(lines: string[]): {
  sections: Array<{ title: string; items: string[] }>;
} {
  const sections: Array<{ title: string; items: string[] }> = [];
  
  console.log('🎯 开始通用结构分析...');
  
  // 第一步：识别潜在的标题行
  const titleCandidates = identifyTitleCandidates(lines.slice(1));
  console.log('📝 识别出的标题候选:', titleCandidates.map(t => t.text));
  
  if (titleCandidates.length === 0) {
    // 如果没有明显的标题，使用简单分组策略
    return createSimpleGrouping(lines);
  }
  
  // 第二步：基于标题构建章节
  const mainTitles = selectMainTitles(titleCandidates);
  console.log('🎯 选择的主要标题:', mainTitles.map(t => t.text));
  
  // 第三步：为每个标题收集内容
  mainTitles.forEach((title, index) => {
    const startIndex = title.index;
    const nextTitle = mainTitles[index + 1];
    const endIndex = nextTitle ? nextTitle.index : lines.length;
    
    // 收集该章节的内容
    const sectionContent = lines.slice(startIndex + 1, endIndex)
      .filter(line => line.length > 2)
      .filter(line => !mainTitles.some(t => t.text === line))
      .slice(0, 6); // 限制每个章节最多6个子项
    
    sections.push({
      title: title.text,
      items: sectionContent
    });
  });
  
  console.log('📊 最终章节数:', sections.length);
  return { sections };
}

/**
 * 识别标题候选项 - 基于文本特征而非关键词
 */
function identifyTitleCandidates(lines: string[]): Array<{ text: string; index: number; score: number }> {
  const candidates: Array<{ text: string; index: number; score: number }> = [];
  
  lines.forEach((line, index) => {
    let score = 0;
    
    // 评分标准1：长度适中（5-50字符）
    if (line.length >= 5 && line.length <= 50) {
      score += 2;
    }
    
    // 评分标准2：不包含常见的句子结束符
    if (!line.includes('。') && !line.includes('，') && !line.includes('、')) {
      score += 2;
    }
    
    // 评分标准3：包含数字编号
    if (/^\d+[\.\)]\s*/.test(line) || /第[一二三四五六七八九十\d]+/.test(line)) {
      score += 3;
    }
    
    // 评分标准4：包含中文序号
    if (/^[一二三四五六七八九十]+[、\.]/.test(line)) {
      score += 3;
    }
    
    // 评分标准5：全大写英文或首字母大写的多个单词
    if (/^[A-Z][A-Z\s]+$/.test(line) || /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+/.test(line)) {
      score += 2;
    }
    
    // 评分标准6：包含常见的章节词汇（通用）
    const sectionWords = ['章', '节', '部分', '阶段', '步骤', 'Chapter', 'Section', 'Part', 'Step'];
    if (sectionWords.some(word => line.includes(word))) {
      score += 2;
    }
    
    // 评分标准7：行前后有空行（在原始文档中可能是标题）
    const prevLine = index > 0 ? lines[index - 1] : '';
    const nextLine = index < lines.length - 1 ? lines[index + 1] : '';
    if (prevLine.length === 0 || nextLine.length === 0) {
      score += 1;
    }
    
    // 只有得分大于等于3的才考虑为标题候选
    if (score >= 3) {
      candidates.push({
        text: line,
        index: index + 1, // +1 因为我们跳过了第一行
        score
      });
    }
  });
  
  // 按得分排序
  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * 从候选标题中选择主要标题
 */
function selectMainTitles(candidates: Array<{ text: string; index: number; score: number }>): Array<{ text: string; index: number }> {
  if (candidates.length === 0) return [];
  
  // 如果候选标题很少，全部使用
  if (candidates.length <= 5) {
    return candidates.map(c => ({ text: c.text, index: c.index }));
  }
  
  // 如果候选标题很多，选择得分最高的前5个
  const topCandidates = candidates.slice(0, 5);
  
  // 按在文档中的出现顺序排序
  return topCandidates
    .sort((a, b) => a.index - b.index)
    .map(c => ({ text: c.text, index: c.index }));
}

/**
 * 简单分组策略 - 当无法识别明显标题时使用
 */
function createSimpleGrouping(lines: string[]): { sections: Array<{ title: string; items: string[] }> } {
  console.log('⚠️ 未找到明显标题，使用简单分组策略');
  
  const sections: Array<{ title: string; items: string[] }> = [];
  const contentLines = lines.slice(1);
  
  // 将内容分为3-5组
  const groupCount = Math.min(5, Math.max(3, Math.ceil(contentLines.length / 8)));
  const groupSize = Math.ceil(contentLines.length / groupCount);
  
  for (let i = 0; i < contentLines.length; i += groupSize) {
    const group = contentLines.slice(i, i + groupSize);
    if (group.length > 0) {
      // 使用组内第一行作为标题，其余作为内容
      const title = group[0];
      const items = group.slice(1, 6); // 最多5个子项
      
      sections.push({
        title: title.length > 30 ? title.substring(0, 30) + '...' : title,
        items: items.filter(item => item.length > 2)
      });
    }
  }
  
  return { sections };
}