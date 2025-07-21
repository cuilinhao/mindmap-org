/**
 * 智能大纲解析器 - 专门处理章节+编号格式的文本
 * 针对"智能文本解析测试文档"这样的格式进行了优化
 */

import type { MindElixirData, MindElixirNode } from './index';

/**
 * 解析智能大纲格式文本为思维导图数据
 * 这个解析器专门针对以下格式进行了优化：
 * - 文档标题
 * - 第X章 标题
 * - 普通段落
 * - X.Y 小节标题
 * - 列表项
 */
export function parseSmartOutlineText(text: string): MindElixirData {
  console.log('🚀 使用智能大纲解析器处理文本');
  console.log('📝 原始文本:', text);

  // 按行分割并过滤空行
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('📋 分割后的行数:', lines.length);
  console.log('📋 所有行:', lines);

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
  console.log('🏷️ 根节点标题:', rootTitle);

  // 创建根节点
  const rootNode: MindElixirNode = {
    topic: rootTitle,
    id: 'root',
    children: []
  };

  // 解析章节结构
  let currentChapter: MindElixirNode | null = null;
  let currentSection: MindElixirNode | null = null;
  let nodeIdCounter = 1;

  // 从第二行开始解析
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    console.log(`\n🔍 解析第${i+1}行: "${line}"`);
    console.log(`📊 当前状态 - 章节: ${currentChapter?.topic || '无'}, 小节: ${currentSection?.topic || '无'}`);

    // 检测章节标题（如"第一章 项目概述"）
    const chapterMatch = line.match(/^第[一二三四五六七八九十\d]+章\s*(.+)/);

    // 检测编号小节（如"1.1 项目背景"）
    const sectionMatch = line.match(/^(\d+)\.(\d+)(?:\.(\d+))?\s+(.+)/);

    // 检测列表项（如"- 实现智能文本层级识别"）
    const listItemMatch = line.match(/^[-•*+]\s+(.+)/);

    // 检测编号列表项（如"1. 项目背景"）
    const numberedListMatch = line.match(/^(\d+)[\.、)]\s+(.+)/);

    console.log(`  📋 章节匹配: ${chapterMatch ? '✅ 是' : '❌ 否'} ${chapterMatch ? `(${chapterMatch[0]})` : ''}`);
    console.log(`  📋 小节匹配: ${sectionMatch ? '✅ 是' : '❌ 否'} ${sectionMatch ? `(${sectionMatch[1]}.${sectionMatch[2]})` : ''}`);
    console.log(`  📋 列表项匹配: ${listItemMatch ? '✅ 是' : '❌ 否'}`);
    console.log(`  📋 编号列表匹配: ${numberedListMatch ? '✅ 是' : '❌ 否'}`);

    if (chapterMatch) {
      // 这是一个章节标题
      console.log(`  🏗️ 创建章节节点: ${line}`);
      currentChapter = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      rootNode.children.push(currentChapter);
      currentSection = null;
      console.log(`  ✅ 章节已添加到根节点，当前根节点子节点数: ${rootNode.children.length}`);
      
    } else if (sectionMatch) {
      // 这是一个编号小节
      const chapterNum = parseInt(sectionMatch[1]);
      const sectionNum = parseInt(sectionMatch[2]);

      console.log(`  🏗️ 创建小节节点: ${line}`);
      console.log(`  📊 解析出的章节号: ${chapterNum}, 小节号: ${sectionNum}`);

      // 创建小节节点
      currentSection = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      
      // 确保小节被添加到正确的章节下
      console.log(`  🔗 尝试将小节添加到章节下...`);
      if (currentChapter) {
        console.log(`  ✅ 有当前章节: "${currentChapter.topic}"`);
        if (!currentChapter.children) {
          currentChapter.children = [];
        }
        currentChapter.children.push(currentSection);
        console.log(`  ✅ 小节 "${line}" 已添加到章节 "${currentChapter.topic}" 下，章节子节点数: ${currentChapter.children.length}`);
      } else {
        console.log(`  ❌ 没有当前章节，尝试根据编号查找匹配的章节...`);
        console.log(`  🔍 当前根节点子节点数: ${rootNode.children.length}`);

        // 如果没有当前章节，尝试根据编号查找匹配的章节
        let found = false;

        // 将中文数字转换为阿拉伯数字进行匹配
        const chineseToNumber = (chinese: string): number => {
          const map: Record<string, number> = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
          };
          // 先尝试中文数字映射，如果没有则尝试解析为数字
          return map[chinese] || parseInt(chinese) || 0;
        };

        // 遍历所有根节点的子节点，查找匹配的章节
        for (let j = 0; j < rootNode.children.length; j++) {
          const node = rootNode.children[j];
          console.log(`  🔍 检查根节点子节点${j}: "${node.topic}"`);

          const chapterNumMatch = node.topic.match(/^第([一二三四五六七八九十\d]+)章/);
          if (chapterNumMatch) {
            const chapterNumberStr = chapterNumMatch[1];
            const chapterNumber = chineseToNumber(chapterNumberStr);
            console.log(`    📊 章节: "${node.topic}"`);
            console.log(`    📊 章节号字符串: "${chapterNumberStr}"`);
            console.log(`    📊 解析出的章节号: ${chapterNumber}`);
            console.log(`    📊 目标章节号: ${chapterNum}`);

            if (chapterNumber === chapterNum) {
              // 找到匹配的章节
              console.log(`    ✅ 找到匹配的章节!`);
              if (!node.children) {
                node.children = [];
              }
              node.children.push(currentSection);
              currentChapter = node; // 关键：更新当前章节指针
              found = true;
              console.log(`    ✅ 小节 "${line}" 已添加到匹配的章节 "${node.topic}" 下`);
              console.log(`    📊 章节子节点数: ${node.children.length}`);
              break;
            } else {
              console.log(`    ❌ 章节号不匹配: ${chapterNumber} !== ${chapterNum}`);
            }
          } else {
            console.log(`    ❌ 不是章节格式: "${node.topic}"`);
          }
        }

        if (!found) {
          // 如果没有找到匹配的章节，添加到根节点
          console.log(`  ❌ 未找到匹配章节，将小节添加到根节点下`);
          rootNode.children.push(currentSection);
          console.log(`  ✅ 小节 "${line}" 已添加到根节点下，根节点子节点数: ${rootNode.children.length}`);
        }
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
      
      // 添加到当前小节或章节
      if (currentSection) {
        if (!currentSection.children) {
          currentSection.children = [];
        }
        currentSection.children.push(listItemNode);
        console.log(`  将列表项 "${content}" 添加到小节 "${currentSection.topic}" 下`);
      } else if (currentChapter) {
        if (!currentChapter.children) {
          currentChapter.children = [];
        }
        currentChapter.children.push(listItemNode);
        console.log(`  将列表项 "${content}" 添加到章节 "${currentChapter.topic}" 下`);
      } else {
        rootNode.children.push(listItemNode);
        console.log(`  将列表项 "${content}" 添加到根节点下`);
      }
      
    } else {
      // 普通段落
      const paragraphNode: MindElixirNode = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      
      // 添加到当前小节或章节
      if (currentSection) {
        if (!currentSection.children) {
          currentSection.children = [];
        }
        currentSection.children.push(paragraphNode);
        console.log(`  将段落添加到小节 "${currentSection.topic}" 下`);
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
  console.log('\n🎉 智能大纲解析完成!');
  console.log('📊 最终结构统计:');
  console.log(`  根节点: "${rootNode.topic}"`);
  console.log(`  根节点子节点数: ${rootNode.children.length}`);

  rootNode.children.forEach((child, index) => {
    console.log(`  子节点${index + 1}: "${child.topic}" (子节点数: ${child.children?.length || 0})`);
    if (child.children && child.children.length > 0) {
      child.children.forEach((grandChild, gIndex) => {
        console.log(`    孙节点${gIndex + 1}: "${grandChild.topic}" (子节点数: ${grandChild.children?.length || 0})`);
      });
    }
  });

  console.log('\n📋 完整解析结果:', JSON.stringify(rootNode, null, 2));

  return { nodeData: rootNode };
}