import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('测试思维导图导出图片功能', async ({ page, context }) => {
  // 设置下载路径监听
  const downloadPromise = page.waitForEvent('download');
  
  // 导航到思维导图页面
  await page.goto('http://localhost:3000/mindmap/test');
  
  // 等待页面加载完成
  await page.waitForSelector('.mind-elixir-custom', { timeout: 10000 });
  
  console.log('思维导图页面已加载');
  
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
  const downloadPath = path.join(__dirname, 'downloads', download.suggestedFilename());
  await download.saveAs(downloadPath);
  console.log(`文件已保存到: ${downloadPath}`);
  
  // 验证文件是否存在且大小合理
  expect(fs.existsSync(downloadPath)).toBeTruthy();
  const fileStats = fs.statSync(downloadPath);
  console.log(`文件大小: ${fileStats.size} 字节`);
  
  // 文件大小应该大于某个合理的值，表示图片内容完整
  expect(fileStats.size).toBeGreaterThan(10000); // 假设正常图片至少10KB
  
  console.log('测试完成');
});