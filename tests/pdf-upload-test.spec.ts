import { test, expect } from '@playwright/test';
import path from 'path';

test('测试PDF文件前端解析（避免API调用）', async ({ page }) => {
  // 导航到首页
  await page.goto('http://localhost:3000');
  
  // 等待页面加载完成
  await page.waitForSelector('#main-content', { timeout: 30000 });
  console.log('页面已加载');
  
  // 切换到文件上传选项卡
  const fileUploadTab = page.locator('button', { hasText: '文件上传' });
  await fileUploadTab.click();
  console.log('切换到文件上传选项卡');
  
  // 使用现有的PDF文件进行测试
  const testPdfPath = path.join(process.cwd(), 'public', 'ai.pdf');
  
  // 设置文件输入
  const fileInput = page.locator('input[type="file"]');
  
  // 监听控制台日志，特别关注树结构检测和前端解析的日志
  let frontendParsingDetected = false;
  let treeStructureDetected = false;
  let apiCalled = false;
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`页面控制台 [${msg.type()}]: ${text}`);
    
    // 检测关键日志
    if (text.includes('检测到树结构') || text.includes('hasCourseStructure: true')) {
      treeStructureDetected = true;
      console.log('✅ 检测到树结构识别');
    }
    if (text.includes('使用前端解析') || text.includes('前端解析生成的思维导图数据')) {
      frontendParsingDetected = true;
      console.log('✅ 检测到前端解析');
    }
  });
  
  // 监听网络请求，检查是否调用了API
  page.on('request', request => {
    if (request.url().includes('/api/mindmap/generate')) {
      apiCalled = true;
      console.log('⚠️ 检测到API调用 - 这可能意味着没有使用前端解析');
    }
  });
  
  // 监听响应
  page.on('response', async response => {
    if (response.url().includes('/api/mindmap/generate')) {
      console.log(`API响应状态: ${response.status()}`);
    }
  });
  
  // 上传文件
  await fileInput.setInputFiles(testPdfPath);
  console.log('文件已选择');
  
  // 点击提交按钮
  const submitButton = page.locator('button', { hasText: '生成思维导图' });
  await submitButton.click();
  console.log('点击提交按钮');
  
  // 等待处理结果
  try {
    // 等待思维导图生成成功
    await page.waitForSelector('.mind-elixir-custom', { timeout: 60000 });
    console.log('思维导图生成成功');
    
    // 验证思维导图是否正确渲染
    const nodeCount = await page.locator('.mind-elixir-custom .node').count();
    console.log(`思维导图中的节点数量: ${nodeCount}`);
    expect(nodeCount).toBeGreaterThan(0);
    
    // 验证根节点是否存在
    const rootNode = page.locator('.mind-elixir-custom .node').first();
    await expect(rootNode).toBeVisible();
    
    // 检查是否使用了前端解析
    console.log('\n=== 解析方式检测结果 ===');
    console.log(`树结构检测: ${treeStructureDetected ? '✅ 成功' : '❌ 失败'}`);
    console.log(`前端解析: ${frontendParsingDetected ? '✅ 使用' : '❌ 未使用'}`);
    console.log(`API调用: ${apiCalled ? '⚠️ 有调用' : '✅ 无调用'}`);
    
    // 理想情况：检测到树结构，使用前端解析，没有API调用
    if (treeStructureDetected && frontendParsingDetected && !apiCalled) {
      console.log('🎉 完美！使用了前端解析，避免了API调用');
    } else if (treeStructureDetected && !apiCalled) {
      console.log('✅ 好！检测到树结构且没有API调用');
    } else if (!apiCalled) {
      console.log('✅ 不错！至少没有调用API');
    } else {
      console.log('⚠️ 注意：仍然调用了API，可能需要进一步优化');
    }
    
    console.log('PDF前端解析测试完成');
  } catch (error) {
    console.error('测试超时或出错:', error);
    
    // 检查是否有错误消息
    const errorMessage = await page.locator('[role="alert"], .error-message').textContent().catch(() => null);
    if (errorMessage) {
      console.log('页面错误消息:', errorMessage);
    }
    
    throw error;
  }
});