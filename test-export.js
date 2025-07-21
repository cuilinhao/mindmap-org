const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  // 创建下载目录
  const downloadsDir = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // 启动浏览器
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log('导航到首页...');
    await page.goto('http://localhost:3000');
    
    console.log('等待首页加载...');
    await page.waitForSelector('body', { timeout: 30000 });
    
    // 检查是否有思维导图数据
    console.log('尝试创建思维导图...');
    
    // 输入一些文本来生成思维导图
    const textArea = await page.locator('textarea').first();
    await textArea.fill('# 智能文本解析测试文档\n\n## 第一章 文本解析\n\n### 1.1 自然语言处理\n- 语义分析和理解\n- 文本分类和聚类\n\n### 1.2 结构化数据提取\n- 实体识别和关系抽取\n- 信息抽取和知识图谱\n\n## 第二章 技术实现\n\n### 2.1 文本预处理\n- 分词和词性标注\n- 停用词过滤\n\n### 2.2 深度学习模型\n- 循环神经网络\n- Transformer架构\n\n### 2.3 前端技术栈\n- React 18.0+\n- TypeScript 5.0+\n- Tailwind CSS\n- Next.js 13.2+\n\n## 第三章 核心功能\n\n### 3.1 文本解析引擎\n- 支持多种格式文本解析，包括TXT、PDF、DOC等格式，转换成结构化数据\n\n### 3.2 思维导图生成\n- 基于文本结构自动生成思维导图\n- 支持手动调整节点位置和样式\n\n### 3.3 数据可视化展示\n- 图表展示\n- 交互式操作');
    
    // 点击生成按钮
    const generateButton = await page.getByRole('button', { name: /生成思维导图|Generate Mind Map/i });
    await generateButton.click();
    
    // 等待思维导图生成
    console.log('等待思维导图生成...');
    await page.waitForSelector('.mind-elixir-custom', { timeout: 60000 });
    
    console.log('思维导图已加载，截取页面...');
    await page.screenshot({ path: path.join(downloadsDir, 'mindmap-page.png') });
    
    // 获取思维导图中的节点数量
    const nodeCount = await page.locator('.mind-elixir-custom .node').count();
    console.log(`思维导图中的节点数量: ${nodeCount}`);
    
    // 截取思维导图区域
    const mindmapElement = await page.locator('.mind-elixir-custom');
    await mindmapElement.screenshot({ path: path.join(downloadsDir, 'mindmap-before-export.png') });
    
    console.log('准备点击导出图片按钮...');
    // 等待下载事件
    const downloadPromise = page.waitForEvent('download');
    
    // 点击导出图片按钮 (使用更精确的选择器)
    const exportButton = await page.locator('button:has([data-lucide="image"])').first();
    await exportButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('找到导出图片按钮，点击...');
    await exportButton.click();
    
    // 等待下载开始
    const download = await downloadPromise;
    console.log(`文件开始下载: ${download.suggestedFilename()}`);
    
    // 保存下载的文件
    const downloadPath = path.join(downloadsDir, download.suggestedFilename());
    await download.saveAs(downloadPath);
    console.log(`文件已保存到: ${downloadPath}`);
    
    // 验证文件是否存在且大小合理
    if (fs.existsSync(downloadPath)) {
      const fileStats = fs.statSync(downloadPath);
      console.log(`导出图片大小: ${fileStats.size} 字节`);
      
      if (fileStats.size > 10000) {
        console.log('✅ 测试通过: 导出的图片大小合理');
      } else {
        console.log('❌ 测试失败: 导出的图片太小，可能内容不完整');
      }
    } else {
      console.log('❌ 测试失败: 未找到导出的图片文件');
    }
    
    console.log('测试完成，请查看下载目录中的图片');
    
    // 等待用户查看结果
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await browser.close();
  }
})();