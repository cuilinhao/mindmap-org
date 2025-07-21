// 测试Markdown文件处理
const fs = require('fs');
const path = require('path');

// 读取测试Markdown文件
const markdownContent = fs.readFileSync('/Users/linhao/Desktop/test.md', 'utf-8');
console.log('Markdown文件内容:', markdownContent.substring(0, 100) + '...');

// 检查文件是否包含Markdown特征
const hasMarkdownHeadings = markdownContent.split('\n')
                            .some(line => /^#{1,6}\s+.+/.test(line.trim()));
const hasMarkdownCodeBlocks = markdownContent.includes('```');
const hasMarkdownLinks = markdownContent.includes('](');
const hasMarkdownLists = markdownContent.split('\n')
                        .filter(line => /^\s*[-*+]\s+.+/.test(line)).length > 2;

console.log('Markdown特征检测:');
console.log('- 有Markdown标题?', hasMarkdownHeadings);
console.log('- 有代码块?', hasMarkdownCodeBlocks);
console.log('- 有链接?', hasMarkdownLinks);
console.log('- 有列表?', hasMarkdownLists);

// 模拟文件对象
const mockFile = {
  name: 'test.md',
  type: '', // 模拟浏览器可能不正确识别MIME类型的情况
  size: markdownContent.length,
  text: async () => markdownContent
};

console.log('模拟文件对象:', mockFile);

// 检查文件扩展名
const fileExtension = mockFile.name.toLowerCase().split('.').pop();
const isMarkdownFile = fileExtension === 'md' || fileExtension === 'markdown';
console.log('文件扩展名:', fileExtension, 'Markdown文件?', isMarkdownFile);

console.log('测试完成');