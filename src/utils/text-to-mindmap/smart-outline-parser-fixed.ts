/**
 * 修复版智能大纲解析器 - 专门处理章节+编号格式的文本
 */

import type { MindElixirData, MindElixirNode } from './index';

/**
 * 解析智能大纲格式文本为思维导图数据
 */
export function parseSmartOutlineTextFixed(text: string): MindElixirData {
  console.log('🚀 使用修复版智能大纲解析器');
  
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

  // 根节点
  const rootNode: MindElixirNode = {
    topic: lines[0],
    id: 'root',
    children: []
  };

  let nodeIdCounter = 1;
  
  // 中文数字转换
  const chineseToNumber = (chinese: string): number => {
    const map: Record<string, number> = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
    };
    return map[chinese] || parseInt(chinese) || 0;
  };

  // 查找章节节点（包括根节点）
  const findChapterByNumber = (chapterNum: number): MindElixirNode | null => {
    // 首先检查根节点是否是对应的章节
    const rootMatch = rootNode.topic.match(/^第([一二三四五六七八九十\d]+)章/);
    if (rootMatch) {
      const rootNum = chineseToNumber(rootMatch[1]);
      if (rootNum === chapterNum) {
        return rootNode;
      }
    }

    // 然后检查子节点
    for (const child of rootNode.children) {
      const match = child.topic.match(/^第([一二三四五六七八九十\d]+)章/);
      if (match) {
        const num = chineseToNumber(match[1]);
        if (num === chapterNum) {
          return child;
        }
      }
    }
    return null;
  };

  // 解析每一行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    console.log(`\n解析行 ${i+1}: "${line}"`);

    // 检测章节标题
    const chapterMatch = line.match(/^第[一二三四五六七八九十\d]+章\s*(.+)/);
    if (chapterMatch) {
      console.log('  → 识别为章节');
      const chapterNode: MindElixirNode = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      rootNode.children.push(chapterNode);
      continue;
    }

    // 检测编号小节
    const sectionMatch = line.match(/^(\d+)\.(\d+)(?:\.(\d+))?\s+(.+)/);
    if (sectionMatch) {
      const chapterNum = parseInt(sectionMatch[1]);
      console.log(`  → 识别为小节，章节号: ${chapterNum}`);
      
      const sectionNode: MindElixirNode = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };

      // 查找对应的章节
      const targetChapter = findChapterByNumber(chapterNum);
      if (targetChapter) {
        console.log(`  → 添加到章节: "${targetChapter.topic}"`);
        if (!targetChapter.children) {
          targetChapter.children = [];
        }
        targetChapter.children.push(sectionNode);
      } else {
        console.log(`  → 未找到章节，添加到根节点`);
        rootNode.children.push(sectionNode);
      }
      continue;
    }

    // 检测列表项
    const listMatch = line.match(/^[-•*+]\s+(.+)/);
    if (listMatch) {
      console.log('  → 识别为列表项');
      const listNode: MindElixirNode = {
        topic: listMatch[1],
        id: `node-${nodeIdCounter++}`,
        children: []
      };

      // 添加到最近的小节
      let added = false;

      // 查找最近的小节（从后往前查找）
      for (let j = rootNode.children.length - 1; j >= 0; j--) {
        const child = rootNode.children[j];
        // 检查是否是小节（格式：数字.数字）
        if (/^\d+\.\d+/.test(child.topic)) {
          if (!child.children) {
            child.children = [];
          }
          child.children.push(listNode);
          console.log(`  → 添加到小节: "${child.topic}"`);
          added = true;
          break;
        }
      }

      // 如果没有找到小节，添加到根节点
      if (!added) {
        rootNode.children.push(listNode);
        console.log(`  → 添加到根节点`);
      }
      continue;
    }

    // 普通段落
    console.log('  → 识别为普通段落');
    const paragraphNode: MindElixirNode = {
      topic: line,
      id: `node-${nodeIdCounter++}`,
      children: []
    };
    
    // 添加到最近的章节
    if (rootNode.children.length > 0) {
      const lastChapter = rootNode.children[rootNode.children.length - 1];
      if (!lastChapter.children) {
        lastChapter.children = [];
      }
      lastChapter.children.push(paragraphNode);
    } else {
      rootNode.children.push(paragraphNode);
    }
  }

  // 打印详细的树形结构
  console.log('\n🎉 解析完成，最终结构:');
  console.log(`根节点: "${rootNode.topic}"`);
  console.log(`子节点数: ${rootNode.children.length}`);

  // 递归打印树形结构的函数
  function printTreeStructure(node, indent = '') {
    console.log(`${indent}├─ "${node.topic}" (ID: ${node.id})`);
    if (node.children && node.children.length > 0) {
      node.children.forEach((child, index) => {
        const isLast = index === node.children.length - 1;
        const newIndent = indent + (isLast ? '   ' : '│  ');
        printTreeStructure(child, newIndent);
      });
    }
  }

  console.log('\n📊 完整树形结构:');
  printTreeStructure(rootNode);

  // 验证层级关系
  console.log('\n🔍 层级关系验证:');
  rootNode.children.forEach((child, i) => {
    console.log(`第${i+1}级子节点: "${child.topic}"`);
    if (child.children && child.children.length > 0) {
      child.children.forEach((grandChild, j) => {
        console.log(`  └─ 第${j+1}个子节点: "${grandChild.topic}"`);
        if (grandChild.children && grandChild.children.length > 0) {
          grandChild.children.forEach((greatGrandChild, k) => {
            console.log(`    └─ 第${k+1}个子节点: "${greatGrandChild.topic}"`);
          });
        }
      });
    }
  });

  // 特别检查章节和小节的关系
  console.log('\n🎯 章节-小节关系检查:');
  const chapter1 = rootNode.children.find(child => child.topic.includes('第一章'));
  if (chapter1) {
    console.log(`✅ 找到第一章: "${chapter1.topic}"`);
    console.log(`第一章子节点数: ${chapter1.children?.length || 0}`);
    if (chapter1.children) {
      chapter1.children.forEach((child, i) => {
        console.log(`  子节点${i+1}: "${child.topic}"`);
      });
    }
  } else {
    console.log('❌ 未找到第一章');
  }

  return { nodeData: rootNode };
}
