const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('导航到思维导图页面...');
    await page.goto('http://localhost:3000/mindmap/test');
    
    console.log('等待思维导图加载...');
    await page.waitForSelector('.mind-elixir-custom', { timeout: 30000 });
    
    console.log('思维导图已加载，截取参考图...');
    await page.screenshot({ path: path.join(downloadsDir, 'before-export.png') });
    
    // 获取思维导图中的节点数量
    const nodeCount = await page.locator('.mind-elixir-custom .node').count();
    console.log(`思维导图中的节点数量: ${nodeCount}`);
    
    console.log('准备点击导出图片按钮...');
    // 等待下载事件
    const downloadPromise = page.waitForEvent('download');
    
    // 点击导出图片按钮
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
    
    console.log('测试完成，请手动检查导出的图片是否完整显示所有节点');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    // 等待几秒，以便查看结果
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 关闭浏览器
    await browser.close();
  }
})();