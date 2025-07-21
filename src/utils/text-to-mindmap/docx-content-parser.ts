import { MindElixirData, MindElixirNode } from '@/types/mindmap';

/**
 * DOCX内容解析器
 * 专门处理从DOCX文件提取的文本内容，生成思维导图结构
 */

/**
 * 解析DOCX文本内容为思维导图数据
 */
export function parseDocxContentText(text: string): MindElixirData {
  console.log('🚀 使用DOCX内容解析器处理文本');
  console.log('📝 原始文本长度:', text.length);
  console.log('📄 原始文本前200字符:', text.substring(0, 200));
  
  // 按行分割并过滤空行
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('📋 分割后的行数:', lines.length);
  console.log('📋 前10行内容:');
  lines.slice(0, 10).forEach((line, index) => {
    console.log(`  ${index + 1}. "${line}"`);
  });
  
  if (lines.length === 0) {
    console.log('❌ 文本为空，返回默认结构');
    return {
      nodeData: {
        topic: '空白思维导图',
        id: 'root',
        children: []
      }
    };
  }

  // 分析文本结构，提取标题和描述
  console.log('🔍 开始分析DOCX内容结构...');
  const contentStructure = analyzeDocxContent(lines);
  console.log('📊 内容结构分析结果:', JSON.stringify(contentStructure, null, 2));

  // 构建思维导图结构
  const rootNode: MindElixirNode = {
    topic: contentStructure.mainTitle || lines[0],
    id: 'root',
    children: []
  };
  console.log('🌳 根节点标题:', rootNode.topic);

  let nodeIdCounter = 1;

  // 添加主要章节
  console.log(`🏗️ 开始构建思维导图，共有 ${contentStructure.sections.length} 个章节`);
  contentStructure.sections.forEach((section, sectionIndex) => {
    console.log(`📂 处理章节 ${sectionIndex + 1}: "${section.title}"`);
    console.log(`   子主题数量: ${section.subtopics.length}`);
    
    const sectionNode: MindElixirNode = {
      topic: section.title,
      id: `node-${nodeIdCounter++}`,
      children: []
    };

    // 添加子主题
    section.subtopics.forEach((subtopic, subtopicIndex) => {
      console.log(`  📌 处理子主题 ${subtopicIndex + 1}: "${subtopic.title}"`);
      console.log(`     描述长度: ${subtopic.description?.length || 0}`);
      
      const subtopicNode: MindElixirNode = {
        topic: subtopic.title,
        id: `node-${nodeIdCounter++}`,
        children: []
      };

      // 如果有描述，添加为子节点
      if (subtopic.description && subtopic.description.length > 0) {
        console.log(`     📝 添加描述: "${subtopic.description.substring(0, 50)}..."`);
        // 将长描述分割成多个要点
        const descriptionPoints = splitDescription(subtopic.description);
        console.log(`     📋 分割成 ${descriptionPoints.length} 个要点`);
        descriptionPoints.forEach((point, pointIndex) => {
          if (point.trim().length > 0) {
            console.log(`       ${pointIndex + 1}. "${point.trim().substring(0, 30)}..."`);
            subtopicNode.children!.push({
              topic: point.trim(),
              id: `node-${nodeIdCounter++}`,
              children: []
            });
          }
        });
      }

      sectionNode.children!.push(subtopicNode);
      console.log(`     ✅ 子主题节点已添加，子节点数: ${subtopicNode.children!.length}`);
    });

    // 如果章节有直接描述，也添加进去
    if (section.description) {
      const descPoints = splitDescription(section.description);
      descPoints.forEach(point => {
        if (point.trim().length > 0) {
          sectionNode.children!.push({
            topic: point.trim(),
            id: `node-${nodeIdCounter++}`,
            children: []
          });
        }
      });
    }

    rootNode.children.push(sectionNode);
    console.log(`✅ 章节 "${section.title}" 已添加到根节点，子节点数: ${sectionNode.children!.length}`);
  });

  console.log('✅ DOCX内容解析完成，生成节点数:', nodeIdCounter - 1);
  console.log('🌳 根节点:', rootNode.topic);
  console.log('📊 主要章节数:', rootNode.children.length);
  
  // 详细输出最终结构
  console.log('🗺️ 最终思维导图结构:');
  console.log(`根节点: ${rootNode.topic}`);
  rootNode.children.forEach((child, index) => {
    console.log(`├─ ${child.topic} (${child.children?.length || 0} 个子节点)`);
    if (child.children && child.children.length > 0) {
      child.children.forEach((grandchild, gIndex) => {
        const isLast = gIndex === child.children!.length - 1;
        console.log(`│  ${isLast ? '└─' : '├─'} ${grandchild.topic}`);
      });
    }
  });

  return {
    nodeData: rootNode
  };
}

/**
 * 分析DOCX内容结构，提取标题和描述
 */
function analyzeDocxContent(lines: string[]): {
  mainTitle: string;
  sections: Array<{
    title: string;
    description?: string;
    subtopics: Array<{ title: string; description?: string; }>;
  }>;
} {
  console.log('🔍 分析DOCX内容结构...');
  
  // 查找主标题（通常是第一个有意义的行）
  let mainTitle = '文档内容';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 3 && line.length < 100) {
      mainTitle = line;
      break;
    }
  }
  
  console.log('🏷️ 主标题:', mainTitle);
  
  const sections: Array<{
    title: string;
    description?: string;
    subtopics: Array<{ title: string; description?: string; }>;
  }> = [];
  
  // 通用的章节和子主题检测逻辑
  console.log('🔍 开始通用章节检测...');
  
  // 首先尝试检测特定的文档结构
  const docxSections = detectDocxStructure(lines);
  if (docxSections.length > 0) {
    console.log(`📚 检测到DOCX文档结构，找到 ${docxSections.length} 个章节`);
    sections.push(...docxSections);
  } else {
    // 如果没有特定结构，使用通用的结构检测
    console.log('📋 使用通用结构检测...');
    const genericSections = detectGenericDocxStructure(lines);
    if (genericSections.length > 0) {
      console.log(`📊 检测到通用结构，找到 ${genericSections.length} 个章节`);
      sections.push(...genericSections);
    }
  }

  console.log(`📊 分析完成，找到 ${sections.length} 个章节`);
  sections.forEach((section, index) => {
    console.log(`  章节 ${index + 1}: ${section.title} (${section.subtopics.length} 个子主题)`);
  });
  
  return {
    mainTitle,
    sections
  };
}

/**
 * 检测DOCX文档特定结构
 */
function detectDocxStructure(lines: string[]): Array<{
  title: string;
  description?: string;
  subtopics: Array<{ title: string; description?: string; }>;
}> {
  const sections: Array<{
    title: string;
    description?: string;
    subtopics: Array<{ title: string; description?: string; }>;
  }> = [];

  // 查找可能的标题行（包含数字编号、较短、格式化等特征）
  const potentialTitles: Array<{ line: string; index: number; score: number }> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 跳过过短或过长的行
    if (line.length < 3 || line.length > 100) {
      continue;
    }
    
    // 计算标题可能性分数
    let score = 0;
    
    // 包含数字编号的加分（如：1. 2. 一、二、等）
    if (/^[\d一二三四五六七八九十]+[.、：:]/.test(line)) score += 3;
    
    // 长度适中的加分
    if (line.length >= 5 && line.length <= 50) score += 2;
    
    // 包含关键词的加分
    const keywords = ['概述', '介绍', '背景', '目标', '方法', '步骤', '结论', '总结', '建议'];
    if (keywords.some(keyword => line.includes(keyword))) score += 2;
    
    // 全大写或包含特殊格式的加分
    if (/[A-Z]{2,}/.test(line) || line.includes('【') || line.includes('】')) score += 1;
    
    if (score >= 3) {
      potentialTitles.push({ line, index: i, score });
    }
  }
  
  // 按分数排序
  potentialTitles.sort((a, b) => b.score - a.score);
  
  console.log(`📊 找到 ${potentialTitles.length} 个潜在标题:`);
  potentialTitles.slice(0, 5).forEach((title, index) => {
    console.log(`  ${index + 1}. "${title.line}" (分数: ${title.score})`);
  });
  
  // 为每个高分标题创建章节
  for (const titleInfo of potentialTitles.slice(0, 8)) { // 最多取前8个
    const section = {
      title: titleInfo.line,
      description: '',
      subtopics: [] as Array<{ title: string; description?: string; }>
    };
    
    // 查找该标题后的内容作为子主题
    for (let i = titleInfo.index + 1; i < Math.min(titleInfo.index + 15, lines.length); i++) {
      const line = lines[i];
      
      // 如果遇到下一个标题，停止
      if (potentialTitles.some(t => t.index === i && t.line !== titleInfo.line)) {
        break;
      }
      
      // 如果是较短的行且可能是子主题
      if (line.length >= 5 && line.length <= 80) {
        
        // 收集描述
        let description = '';
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const descLine = lines[j];
          if (descLine && descLine.length > 20 && 
              !potentialTitles.some(t => t.index === j)) {
            description += descLine + ' ';
            break; // 只取第一个描述行
          }
        }
        
        section.subtopics.push({
          title: line,
          description: description.trim()
        });
        
        if (section.subtopics.length >= 6) break; // 每个章节最多6个子主题
      }
    }
    
    // 只有有子主题的章节才添加
    if (section.subtopics.length > 0) {
      sections.push(section);
      console.log(`📂 添加章节: "${section.title}" (${section.subtopics.length} 个子主题)`);
    }
  }
  
  return sections;
}

/**
 * 检测通用DOCX文档结构
 */
function detectGenericDocxStructure(lines: string[]): Array<{
  title: string;
  description?: string;
  subtopics: Array<{ title: string; description?: string; }>;
}> {
  const sections: Array<{
    title: string;
    description?: string;
    subtopics: Array<{ title: string; description?: string; }>;
  }> = [];

  console.log('🔍 开始通用DOCX结构分析...');

  // 查找可能的标题行（较短、包含关键字符、不是纯描述）
  const potentialTitles: Array<{ line: string; index: number; score: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 跳过明显的元数据或过短过长的行
    if (line.length < 3 || line.length > 120) {
      continue;
    }

    // 计算标题可能性分数
    let score = 0;

    // 长度适中的加分
    if (line.length >= 5 && line.length <= 60) score += 2;

    // 包含冒号的加分（常见的标题格式）
    if (line.includes('：') || line.includes(':')) score += 3;

    // 包含项目符号或编号的加分
    if (/^[-•·*]\s+/.test(line) || /^\d+[.、]\s+/.test(line)) score += 2;

    // 包含技术术语的加分
    const techTerms = ['系统', '模块', '功能', '接口', '服务', '组件', '架构', '设计', '实现', '测试'];
    if (techTerms.some(term => line.includes(term))) score += 2;

    // 包含中文且较短的加分
    if (/[\u4e00-\u9fa5]/.test(line) && line.length <= 30) score += 1;

    // 包含英文大写字母的加分
    if (/[A-Z]/.test(line)) score += 1;

    if (score >= 3) {
      potentialTitles.push({ line, index: i, score });
    }
  }

  // 按分数排序
  potentialTitles.sort((a, b) => b.score - a.score);

  console.log(`📊 找到 ${potentialTitles.length} 个潜在标题:`);
  potentialTitles.slice(0, 5).forEach((title, index) => {
    console.log(`  ${index + 1}. "${title.line}" (分数: ${title.score})`);
  });

  // 为每个高分标题创建章节
  for (const titleInfo of potentialTitles.slice(0, 6)) { // 最多取前6个
    const section = {
      title: titleInfo.line,
      description: '',
      subtopics: [] as Array<{ title: string; description?: string; }>
    };

    // 查找该标题后的内容作为子主题
    for (let i = titleInfo.index + 1; i < Math.min(titleInfo.index + 12, lines.length); i++) {
      const line = lines[i];

      // 如果遇到下一个标题，停止
      if (potentialTitles.some(t => t.index === i && t.line !== titleInfo.line)) {
        break;
      }

      // 如果是较短的行且不是纯描述，可能是子主题
      if (line.length >= 5 && line.length <= 100) {

        // 收集描述
        let description = '';
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const descLine = lines[j];
          if (descLine && descLine.length > 20 &&
              !potentialTitles.some(t => t.index === j)) {
            description += descLine + ' ';
            break; // 只取第一个描述行
          }
        }

        section.subtopics.push({
          title: line,
          description: description.trim()
        });

        if (section.subtopics.length >= 5) break; // 每个章节最多5个子主题
      }
    }

    // 只有有子主题的章节才添加
    if (section.subtopics.length > 0) {
      sections.push(section);
      console.log(`📂 添加章节: "${section.title}" (${section.subtopics.length} 个子主题)`);
    }
  }

  return sections;
}

/**
 * 分割描述文本为要点
 */
function splitDescription(description: string): string[] {
  if (!description || description.length < 20) {
    return [description];
  }

  // 按句号分割
  const sentences = description.split(/[。.]/);

  // 过滤空句子并限制长度
  const points = sentences
    .map(s => s.trim())
    .filter(s => s.length > 5)
    .slice(0, 3); // 最多3个要点

  return points.length > 0 ? points : [description];
}
