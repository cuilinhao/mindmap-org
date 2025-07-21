/**
 * 混合格式解析器 - 处理包含章节、编号和列表的混合格式文本
 */

import type { MindElixirData, MindElixirNode } from './index';

/**
 * 解析混合格式文本（章节+编号+列表）为思维导图数据
 */
export function parseMixedFormatText(text: string): MindElixirData {
  console.log('使用混合格式解析器处理文本');
  
  // 按行分割并过滤空行
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length === 0) {
    return {
      nodeData: {
        topic: '空白思维导图',
        id: 'root',
        children: []
      }
    };
  }

  // 提取文档标题（第一行）
  const rootTitle = lines[0];
  let nodeIdCounter = 1;
  
  // 创建根节点
  const rootNode: MindElixirNode = {
    topic: rootTitle,
    id: 'root',
    children: []
  };

  // 当前处理的节点
  let currentChapter: MindElixirNode | null = null;
  let currentSection: MindElixirNode | null = null;
  let currentSubsection: MindElixirNode | null = null;

  // 从第二行开始解析
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测章节标题（如"第一章 项目概述"）
    const chapterMatch = line.match(/^第[一二三四五六七八九十\d]+章\s*(.+)/);
    
    // 检测编号小节（如"1.1 项目背景"）
    const sectionMatch = line.match(/^(\d+)\.(\d+)(?:\.(\d+))?\s+(.+)/);
    
    // 检测列表项（如"- 实现智能文本层级识别"）
    const listItemMatch = line.match(/^[-•*+]\s+(.+)/);
    
    // 检测编号列表项（如"1. 项目背景"）
    const numberedListMatch = line.match(/^(\d+)[\.、)]\s+(.+)/);
    
    // 添加调试信息
    console.log(`解析行: "${line}"`);
    console.log(`  章节匹配: ${chapterMatch ? '是' : '否'}`);
    console.log(`  小节匹配: ${sectionMatch ? '是' : '否'}`);
    console.log(`  列表项匹配: ${listItemMatch ? '是' : '否'}`);
    console.log(`  编号列表匹配: ${numberedListMatch ? '是' : '否'}`);

    if (chapterMatch) {
      // 这是一个章节标题
      currentChapter = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      rootNode.children.push(currentChapter);
      currentSection = null;
      currentSubsection = null;
      
    } else if (sectionMatch) {
      // 这是一个编号小节
      const chapterNum = parseInt(sectionMatch[1]);
      const sectionNum = parseInt(sectionMatch[2]);
      const subsectionNum = sectionMatch[3] ? parseInt(sectionMatch[3]) : null;
      const sectionTitle = sectionMatch[4];
      
      // 提取章节编号的第一部分，用于匹配章节
      // 例如，"1.1 项目背景"中的"1"应该匹配"第一章"
      
      if (subsectionNum) {
        // 这是一个三级小节（如"1.1.1 展会时代"）
        currentSubsection = {
          topic: line, // 保留完整的原始文本
          id: `node-${nodeIdCounter++}`,
          children: []
        };
        
        if (currentSection) {
          if (!currentSection.children) {
            currentSection.children = [];
          }
          currentSection.children.push(currentSubsection);
        } else if (currentChapter) {
          if (!currentChapter.children) {
            currentChapter.children = [];
          }
          currentChapter.children.push(currentSubsection);
        } else {
          rootNode.children.push(currentSubsection);
        }
      } else {
        // 这是一个二级小节（如"1.1 项目背景"）
        currentSection = {
          topic: line, // 保留完整的原始文本
          id: `node-${nodeIdCounter++}`,
          children: []
        };
        
        // 尝试找到匹配的章节
        if (currentChapter) {
          if (!currentChapter.children) {
            currentChapter.children = [];
          }
          currentChapter.children.push(currentSection);
        } else {
          // 如果没有找到匹配的章节，尝试在根节点的子节点中查找
          const matchingChapter = rootNode.children.find(node => {
            const chapterNumMatch = node.topic.match(/^第([一二三四五六七八九十\d]+)章/);
            if (chapterNumMatch) {
              const chapterNumStr = chapterNumMatch[1];
              // 将中文数字转换为阿拉伯数字
              const convertedChapterNum = convertChineseNumberToArabic(chapterNumStr);
              return convertedChapterNum === chapterNum;
            }
            return false;
          });
          
          if (matchingChapter) {
            if (!matchingChapter.children) {
              matchingChapter.children = [];
            }
            matchingChapter.children.push(currentSection);
          } else {
            rootNode.children.push(currentSection);
          }
        }
        currentSubsection = null;
      }
      
    } else if (listItemMatch || numberedListMatch) {
      // 这是一个列表项
      const content = listItemMatch ? 
        listItemMatch[1] : 
        (numberedListMatch ? numberedListMatch[2] : line);
      
      const listItemNode: MindElixirNode = {
        topic: content,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      
      // 添加到当前最深层级的节点
      if (currentSubsection) {
        if (!currentSubsection.children) {
          currentSubsection.children = [];
        }
        currentSubsection.children.push(listItemNode);
      } else if (currentSection) {
        if (!currentSection.children) {
          currentSection.children = [];
        }
        currentSection.children.push(listItemNode);
      } else if (currentChapter) {
        if (!currentChapter.children) {
          currentChapter.children = [];
        }
        currentChapter.children.push(listItemNode);
      } else {
        rootNode.children.push(listItemNode);
      }
      
    } else {
      // 普通段落
      const paragraphNode: MindElixirNode = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      
      // 添加到当前最深层级的节点
      if (currentSubsection) {
        if (!currentSubsection.children) {
          currentSubsection.children = [];
        }
        currentSubsection.children.push(paragraphNode);
      } else if (currentSection) {
        if (!currentSection.children) {
          currentSection.children = [];
        }
        currentSection.children.push(paragraphNode);
      } else if (currentChapter) {
        if (!currentChapter.children) {
          currentChapter.children = [];
        }
        currentChapter.children.push(paragraphNode);
        console.log(`  将段落添加到章节 "${currentChapter.topic}" 下`);
      } else {
        rootNode.children.push(paragraphNode);
        console.log(`  将段落添加到根节点下`);
      }
    }
  }

  // 添加调试日志
  console.log('混合格式解析结果:', JSON.stringify(rootNode, null, 2));
  
  return { nodeData: rootNode };
}

/**
 * 将中文数字转换为阿拉伯数字
 */
function convertChineseNumberToArabic(chineseNumber: string): number {
  const chineseNumerals: Record<string, number> = {
    '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, 
    '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, 
    '十': 10, '百': 100, '千': 1000, '万': 10000
  };
  
  // 如果已经是阿拉伯数字，直接返回
  if (/^\d+$/.test(chineseNumber)) {
    return parseInt(chineseNumber);
  }
  
  // 处理特殊情况
  if (chineseNumber === '十') return 10;
  if (chineseNumber === '百') return 100;
  if (chineseNumber === '千') return 1000;
  if (chineseNumber === '万') return 10000;
  
  // 处理"十X"的情况，如"十一"表示11
  if (chineseNumber.startsWith('十')) {
    const rest = chineseNumber.substring(1);
    if (rest.length === 0) return 10;
    return 10 + convertChineseNumberToArabic(rest);
  }
  
  // 一般情况
  let result = 0;
  let temp = 0;
  let section = 0;
  
  for (let i = 0; i < chineseNumber.length; i++) {
    const char = chineseNumber[i];
    const value = chineseNumerals[char];
    
    if (value === undefined) {
      // 如果不是中文数字，跳过
      continue;
    }
    
    if (value < 10) {
      // 数字
      temp = value;
    } else {
      // 单位
      if (value === 10000) {
        section = (section + temp) * value;
        result += section;
        section = 0;
        temp = 0;
      } else {
        section += temp * value;
        temp = 0;
      }
    }
  }
  
  return result + section + temp;
}