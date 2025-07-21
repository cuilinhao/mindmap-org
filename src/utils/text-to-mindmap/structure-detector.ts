/**
 * 结构检测器 - 检测文本中的结构类型并返回适当的解析策略
 */

/**
 * 文本结构类型枚举
 */
export enum TextStructureType {
  MARKDOWN = 'markdown',
  INDENTED = 'indented',
  NUMBERED_LIST = 'numbered_list',
  BULLET_LIST = 'bullet_list',
  OUTLINE = 'outline',
  YAML = 'yaml',
  JSON = 'json',
  MIXED_FORMAT = 'mixed_format', // 混合格式（章节+编号+列表）
  SMART_OUTLINE = 'smart_outline', // 智能大纲格式（针对特定格式优化）
  PDF_CONTENT = 'pdf_content', // PDF内容格式
  DOCX_CONTENT = 'docx_content', // DOCX内容格式
  PLAIN = 'plain'
}

/**
 * 检测文本的结构类型
 * @param text 要分析的文本
 * @returns 检测到的结构类型
 */
export function detectTextStructure(text: string): TextStructureType {
  console.log('\n🔍 开始检测文本结构...');
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log(`📊 总行数: ${lines.length}`);

  if (lines.length === 0) {
    console.log('❌ 空文本，返回 PLAIN');
    return TextStructureType.PLAIN;
  }
  
  // 检查是否是JSON格式
  if ((text.trim().startsWith('{') && text.trim().endsWith('}')) || 
      (text.trim().startsWith('[') && text.trim().endsWith(']'))) {
    try {
      JSON.parse(text);
      return TextStructureType.JSON;
    } catch (e) {
      // 不是有效的JSON
    }
  }
  
  // 检查是否是YAML格式
  const yamlPattern = /^(\s*)[\w-]+:\s*.+$/;
  const yamlLineCount = lines.filter(line => yamlPattern.test(line)).length;
  if (yamlLineCount > lines.length * 0.5) {
    return TextStructureType.YAML;
  }

  // 检查是否是DOCX内容格式
  console.log('🔍 检查是否为DOCX内容格式...');
  const docxContentPattern = detectDocxContentStructure(lines);
  console.log('📊 DOCX内容检测结果:', docxContentPattern);
  if (docxContentPattern.isDocxContent) {
    console.log('✅ 检测到DOCX内容格式 (DOCX_CONTENT)');
    return TextStructureType.DOCX_CONTENT;
  } else {
    console.log('❌ 不是DOCX内容格式，继续其他检测...');
  }
  
  // 先检查是否是智能大纲格式（优先级最高）
  const chapterPattern = /^第[一二三四五六七八九十\d]+章\s*.+/;
  const sectionPattern = /^\d+\.\d+(?:\.\d+)?\s+.+/;

  const chapterCount = lines.filter(line => chapterPattern.test(line)).length;
  const sectionCount = lines.filter(line => sectionPattern.test(line)).length;
  const bulletListPattern = /^[-•*+]\s+/;
  const bulletLineCount = lines.filter(line => bulletListPattern.test(line)).length;

  console.log(`📊 结构统计: 章节=${chapterCount}, 小节=${sectionCount}, 项目符号=${bulletLineCount}`);

  // 检查是否是智能大纲格式（特定格式的文档结构）
  // 智能大纲的特征：同时有章节和编号小节
  console.log(`🔍 智能大纲检测: 章节数=${chapterCount}, 小节数=${sectionCount}`);

  // 更严格的智能大纲检测条件：
  // 1. 必须同时有章节和小节
  // 2. 小节数量应该合理（至少2个）
  // 3. 没有Markdown标题（避免与Markdown冲突）
  const hasMarkdownHeadings = lines.some(line => /^#{1,6}\s+.+/.test(line));

  if (chapterCount > 0 && sectionCount >= 2 && !hasMarkdownHeadings) {
    console.log('✅ 检测到智能大纲格式文本 (SMART_OUTLINE)');
    return TextStructureType.SMART_OUTLINE;
  }

  // 然后检查是否是Markdown格式
  // 检查Markdown标题
  const markdownHeadings = lines.filter(line => /^#{1,6}\s+.+/.test(line)).length;

  // 检查其他Markdown元素
  const markdownListItems = lines.filter(line => /^\s*[-*+]\s+.+/.test(line)).length;
  const markdownLinks = lines.filter(line => /\[.+?\]\(.+?\)/.test(line)).length;
  const markdownEmphasis = lines.filter(line => /(\*\*|__).+?(\*\*|__)/.test(line) || /(\*|_).+?(\*|_)/.test(line)).length;
  const markdownCodeBlocks = text.includes('```');

  // 如果有明显的Markdown特征，判定为Markdown
  // 更严格的Markdown检测：必须有标题或多种Markdown元素
  const hasMultipleMarkdownFeatures = [
    markdownListItems > 3,
    markdownLinks > 2,
    markdownEmphasis > 2,
    markdownCodeBlocks
  ].filter(Boolean).length >= 2;

  if (markdownHeadings > 0 || hasMultipleMarkdownFeatures) {
    console.log('✅ 检测到Markdown格式文本');
    return TextStructureType.MARKDOWN;
  }


  // 检查是否是混合格式
  // 1. 有章节但没有编号小节（或编号小节很少）
  // 2. 有章节和项目符号列表
  if ((chapterCount > 0 && sectionCount === 0) ||
      (chapterCount > 0 && bulletLineCount > 0) ||
      (sectionCount > 0 && sectionCount < 2)) {
    console.log('检测到混合格式文本');
    return TextStructureType.MIXED_FORMAT;
  }
  
  // 检查是否是大纲格式（如 I. 主题, A. 子主题）
  const outlinePattern = /^[IVXLCDM]+\.\s+|^[A-Z]\.\s+|^\d+\.\d+\.\d+\s+/;
  const outlineLineCount = lines.filter(line => outlinePattern.test(line)).length;
  if (outlineLineCount > lines.length * 0.3) {
    return TextStructureType.OUTLINE;
  }
  
  // 检查是否是编号列表
  const numberedListPattern = /^\d+[\.\)]\s+/;
  const numberedLineCount = lines.filter(line => numberedListPattern.test(line)).length;
  if (numberedLineCount > lines.length * 0.3) {
    return TextStructureType.NUMBERED_LIST;
  }
  
  // 检查是否是简单列表（主要是项目符号，没有复杂结构）
  if (bulletLineCount > 2 && chapterCount === 0 && sectionCount === 0 &&
      markdownHeadings === 0 && markdownLinks === 0) {
    console.log('检测到简单列表');
    return TextStructureType.SIMPLE_LIST;
  }

  // 检查是否是项目符号列表
  if (bulletLineCount > lines.length * 0.3) {
    return TextStructureType.BULLET_LIST;
  }
  
  // 检查是否是缩进结构
  // 需要分析原始行（保留缩进）
  const originalLines = text.split('\n').filter(line => line.length > 0);
  const indentPattern = /^(\s{2,}|\t+)/;
  const indentedLineCount = originalLines.filter(line => indentPattern.test(line)).length;

  // 分析缩进层级
  const indentLevels = {};
  originalLines.forEach(line => {
    const leadingSpaces = line.length - line.trimLeft().length;
    if (leadingSpaces > 0) {
      indentLevels[leadingSpaces] = (indentLevels[leadingSpaces] || 0) + 1;
    }
  });

  const hasMultipleLevels = Object.keys(indentLevels).length > 1;
  const hasConsistentIndent = Object.keys(indentLevels).some(level => parseInt(level) >= 2);

  // 优化的缩进检测条件：
  // 1. 有缩进行且有多层级结构
  // 2. 或者缩进行数超过30%
  if ((indentedLineCount > 0 && hasMultipleLevels && hasConsistentIndent) ||
      (indentedLineCount > originalLines.length * 0.3)) {
    console.log('检测到缩进结构');
    return TextStructureType.INDENTED;
  }
  
  // 默认为普通文本
  console.log('🔄 未匹配任何特定格式，返回 PLAIN');
  return TextStructureType.PLAIN;
}

/**
 * 分析文本结构并返回详细信息
 */
export function analyzeTextStructure(text: string): {
  type: TextStructureType;
  details: Record<string, unknown>;
} {
  const type = detectTextStructure(text);
  const lines = text.split('\n');
  
  const details: Record<string, unknown> = {
    lineCount: lines.length,
    nonEmptyLineCount: lines.filter(Boolean).length
  };
  
  switch (type) {
    case TextStructureType.MARKDOWN:
      details.headingCount = lines.filter(line => /^#{1,6}\s+.+/.test(line.trim())).length;
      details.headingLevels = {};
      for (let i = 1; i <= 6; i++) {
        details.headingLevels[`h${i}`] = lines.filter(line => 
          new RegExp(`^#{${i}}\\s+.+`).test(line.trim())
        ).length;
      }
      break;
      
    case TextStructureType.INDENTED:
      details.indentLevels = {};
      lines.forEach(line => {
        const match = line.match(/^(\s+)/);
        if (match) {
          const indentSize = match[1].length;
          details.indentLevels[indentSize] = (details.indentLevels[indentSize] || 0) + 1;
        }
      });
      break;
      
    case TextStructureType.NUMBERED_LIST:
    case TextStructureType.BULLET_LIST:
      details.listItemCount = lines.filter(line => 
        /^[-•*+]\s+/.test(line.trim()) || /^\d+[\.\)]\s+/.test(line.trim())
      ).length;
      break;
      
    case TextStructureType.OUTLINE:
      details.outlineItemCount = lines.filter(line => 
        /^[IVXLCDM]+\.\s+|^[A-Z]\.\s+|^\d+\.\d+\.\d+\s+/.test(line.trim())
      ).length;
      break;
  }
  
  return { type, details };
}

/**
 * 检测DOCX内容结构
 */
export function detectDocxContentStructure(lines: string[]): {
  isDocxContent: boolean;
  details: {
    potentialTitles: string[];
    titleDescriptions: Array<{ title: string; description: string }>;
    hasDocxKeywords: boolean;
    foundDocxTitles: string[];
    titleCount: number;
    titleDescriptionPairs: number;
  };
} {
  console.log('🔍 检测DOCX内容结构...');

  // 查找潜在的标题（较短的行，可能是标题）
  const potentialTitles = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 3 && trimmed.length < 100;
  });

  // 查找标题+描述的组合
  const titleDescriptions: Array<{ title: string; description: string }> = [];

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].trim();
    const nextLine = lines[i + 1].trim();

    // 如果当前行较短（可能是标题），下一行较长（可能是描述）
    if (currentLine.length > 3 && currentLine.length < 60 &&
        nextLine.length > 20 && nextLine.length > currentLine.length * 1.5) {
      titleDescriptions.push({
        title: currentLine,
        description: nextLine
      });
    }
  }

  console.log(`📊 找到潜在标题: ${potentialTitles.length}个`);
  console.log(`📊 标题+描述对: ${titleDescriptions.length}个`);
  console.log(`📋 标题列表:`, potentialTitles.slice(0, 5));

  // 检查是否包含DOCX相关的关键词
  const docxKeywords = ['概述', '介绍', '背景', '目标', '方法', '步骤', '结论', '总结', '建议', '系统', '模块', '功能', '设计', '实现'];
  const hasDocxKeywords = potentialTitles.some(title =>
    docxKeywords.some(keyword => title.includes(keyword))
  );

  // 特别检查DOCX特有的关键标题
  const docxSpecificTitles = [
    '概述', '介绍', '背景', '目标', '需求分析', '系统设计', '实现方案',
    '测试方案', '部署方案', '总结', '建议', '附录'
  ];

  const foundDocxTitles = docxSpecificTitles.filter(title =>
    lines.some(line => line.includes(title))
  );

  console.log(`🎯 找到DOCX特有标题: ${foundDocxTitles.length} 个`, foundDocxTitles);

  // DOCX内容的判断条件：
  // 1. 找到DOCX特有标题（至少2个）
  // 2. 或者有DOCX关键词且有足够的标题+描述对（至少3个）
  // 3. 或者有大量的标题+描述对（至少4个，避免误识别普通文本）
  const isDocxContent = foundDocxTitles.length >= 2 ||
                       (hasDocxKeywords && titleDescriptions.length >= 3) ||
                       (titleDescriptions.length >= 4);

  console.log(`🎯 DOCX内容检测结果: ${isDocxContent ? '✅' : '❌'}`);

  return {
    isDocxContent,
    details: {
      potentialTitles,
      titleDescriptions,
      hasDocxKeywords,
      foundDocxTitles,
      titleCount: potentialTitles.length,
      titleDescriptionPairs: titleDescriptions.length
    }
  };
}