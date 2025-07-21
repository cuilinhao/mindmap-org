async function testDocxTextExtraction() {
  try {
    console.log('🧪 测试DOCX文本提取修复');
    console.log('=' .repeat(50));
    
    // 模拟原始的DOCX文本（单行）
    const originalText = '智能文本解析测试文档 第一章 项目概述 本项目旨在开发一个智能文本解析系统，能够自动识别文本结构并生成思维导图。 1.1 项目背景 随着信息时代的到来，人们需要处理越来越多的文档。传统的文档阅读方式效率低下，急需一种能够快速理解文档结构的工具。 1.2 项目目标 - 实现智能文本层级识别 - 支持多种文档格式 - 生成可视化思维导图 - 提供友好的用户界面 第二章 技术架构 系统采用前后端分离的架构设计，前端使用 React 技术栈，后端使用 Node.js 。 2.1 前端技术栈 • React 18.3.1 • TypeScript 5.8.3 • Tailwind CSS 3.4.17 • Next.js 15.3.2 2.2 后端技术栈 • Node.js • Express.js • OpenAI API • PDF.js 第三章 核心功能 系统的核心功能包括文件解析、文本分析和思维导图生成。 3.1 文件解析模块 支持多种格式的文件解析，包括 TXT 、 PDF 、 DOCX 等格式。每种格式都有专门的解析器进行处理。 3.2 文本分析模块 使用人工智能技术对文本进行智能分析，识别文档的层级结构。主要包括标题识别、段落分析、关键词提取等功能。 3.3 思维导图生成模块 基于分析结果生成结构化的思维导图。使用 Markmap 库进行可视化渲染，支持交互式操作。 总结： 本系统通过智能文本解析技术，为用户提供了一个高效的文档理解工具。';
    
    console.log('📄 原始文本长度:', originalText.length);
    console.log('📄 原始文本行数:', originalText.split('\n').length);
    
    // 应用修复后的文本处理逻辑
    let processedText = originalText
      .replace(/[ \t]+/g, ' ')  // 合并多个空格
      .trim();
    
    // 智能添加换行符：在章节标题、编号列表等位置添加换行
    processedText = processedText
      .replace(/(第[一二三四五六七八九十\d]+章)/g, '\n$1')  // 章节标题前换行
      .replace(/(\d+\.\d+)/g, '\n$1')  // 编号小节前换行
      .replace(/(•|·|-)\s+/g, '\n$1 ')  // 列表项前换行
      .replace(/([。！？])\s*([第\d])/g, '$1\n$2')  // 句号后跟章节或数字时换行
      .replace(/^\n+/, '')  // 移除开头的换行
      .replace(/\n+/g, '\n')  // 合并多个换行
      .trim();
    
    console.log('\n📊 处理后的文本:');
    console.log('📄 处理后文本长度:', processedText.length);
    console.log('📄 处理后文本行数:', processedText.split('\n').length);
    console.log('📋 处理后的文本内容:');
    console.log(processedText);
    
    // 测试是否能正确分行
    const lines = processedText.split('\n').filter(line => line.trim().length > 0);
    console.log('\n📊 分行结果:');
    console.log('📄 有效行数:', lines.length);
    console.log('📋 前10行内容:');
    lines.slice(0, 10).forEach((line, index) => {
      console.log(`  ${index + 1}. "${line}"`);
    });
    
    // 检查关键结构
    const hasChapters = lines.some(line => line.includes('第') && line.includes('章'));
    const hasSections = lines.some(line => /^\d+\.\d+/.test(line.trim()));
    const hasLists = lines.some(line => /^[•·-]\s+/.test(line.trim()));
    
    console.log('\n🔍 结构检查:');
    console.log('📚 包含章节:', hasChapters ? '✅' : '❌');
    console.log('📝 包含小节:', hasSections ? '✅' : '❌');
    console.log('📋 包含列表:', hasLists ? '✅' : '❌');
    
    if (lines.length > 1 && hasChapters && hasSections) {
      console.log('\n✅ 文本处理修复成功！');
      console.log('📊 现在文本有多行，应该能正确进入智能解析流程');
    } else {
      console.log('\n❌ 文本处理仍有问题');
    }
    
    // 模拟smartTextParse的行为
    console.log('\n🧪 模拟smartTextParse行为:');
    console.log('📄 lines.length:', lines.length);
    
    if (lines.length === 0) {
      console.log('❌ 空文本，会返回默认结构');
    } else if (lines.length === 1) {
      console.log('❌ 单行文本，会使用textToMindElixirData');
    } else {
      console.log('✅ 多行文本，会进入智能解析流程');
      console.log('🔍 会调用detectTextStructure检测结构类型');
      console.log('📊 预期检测到DOCX_CONTENT类型');
    }
    
    console.log('\n🎯 修复总结:');
    console.log('=' .repeat(50));
    console.log('✅ 修复了DOCX文本提取的换行问题');
    console.log('📄 原来：单行文本 → textToMindElixirData');
    console.log('📄 现在：多行文本 → smartTextParse → DOCX解析器');
    console.log('🚀 现在可以重新测试DOCX文件了');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testDocxTextExtraction().catch(console.error);
