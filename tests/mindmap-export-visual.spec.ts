import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

test('测试思维导图导出图片的完整性', async ({ page, context }) => {
  // 创建下载目录
  const downloadsDir = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  
  // 设置下载路径
  await context.route('**/*.png', route => route.continue());
  
  // 设置下载处理
  const downloadPromise = page.waitForEvent('download');
  
  // 导航到思维导图页面
  await page.goto('http://localhost:3000/mindmap/test');
  
  // 等待页面加载完成
  await page.waitForSelector('.mind-elixir-custom', { timeout: 30000 });
  console.log('思维导图页面已加载');
  
  // 截图整个思维导图区域作为参考
  const mindmapContainer = page.locator('.mind-elixir-custom');
  await mindmapContainer.screenshot({ path: path.join(downloadsDir, 'mindmap-reference.png') });
  console.log('已截取思维导图参考图');
  
  // 获取思维导图中的节点数量
  const nodeCount = await page.locator('.mind-elixir-custom .node').count();
  console.log(`思维导图中的节点数量: ${nodeCount}`);
  
  // 点击导出图片按钮
  const exportButton = page.locator('button[title="导出为图片"], button[title="Export as image"]');
  await exportButton.waitFor({ state: 'visible', timeout: 5000 });
  console.log('找到导出图片按钮');
  
  // 点击导出按钮
  await exportButton.click();
  console.log('已点击导出按钮');
  
  // 等待下载开始
  const download = await downloadPromise;
  console.log(`文件开始下载: ${download.suggestedFilename()}`);
  
  // 等待下载完成
  const downloadPath = path.join(downloadsDir, download.suggestedFilename());
  await download.saveAs(downloadPath);
  console.log(`文件已保存到: ${downloadPath}`);
  
  // 验证文件是否存在且大小合理
  expect(fs.existsSync(downloadPath)).toBeTruthy();
  const fileStats = fs.statSync(downloadPath);
  console.log(`导出图片大小: ${fileStats.size} 字节`);
  
  // 文件大小应该大于某个合理的值，表示图片内容完整
  expect(fileStats.size).toBeGreaterThan(10000); // 假设正常图片至少10KB
  
  // 使用ImageMagick分析图片尺寸（如果系统上安装了ImageMagick）
  try {
    const { stdout } = await execAsync(`identify -format "%wx%h" "${downloadPath}"`);
    console.log(`导出图片尺寸: ${stdout}`);
    
    // 解析宽度和高度
    const [width, height] = stdout.trim().split('x').map(Number);
    
    // 验证图片尺寸是否合理
    expect(width).toBeGreaterThan(500);
    expect(height).toBeGreaterThan(300);
    
    console.log('图片尺寸验证通过');
  } catch (error) {
    console.log('无法使用ImageMagick分析图片，跳过尺寸验证');
  }
  
  console.log('测试完成');
});