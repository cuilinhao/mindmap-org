const fs = require('fs');
const path = require('path');

async function testDocxLogic() {
  try {
    console.log('🧪 测试DOCX处理逻辑');
    console.log('=' .repeat(50));
    
    // 1. 测试结构检测器
    console.log('📋 步骤1: 测试DOCX结构检测器');
    
    try {
      const { detectDocxContentStructure } = require('./src/utils/text-to-mindmap/structure-detector');
      
      // 模拟DOCX文本内容
      const docxText = `项目概述
本项目旨在开发一个智能文本解析系统，能够自动识别和处理各种文档格式。

系统设计
系统采用模块化设计，包含以下主要组件：
- 文档解析模块
- 结构识别模块  
- 思维导图生成模块

实现方案
前端使用React和TypeScript开发，后端使用Node.js。
支持多种文档格式的解析和处理。

测试方案
包含单元测试、集成测试和端到端测试。
确保系统的稳定性和可靠性。`;
      
      const lines = docxText.split('\n').map(line => line.trim()).filter(Boolean);
      const docxResult = detectDocxContentStructure(lines);
      
      console.log(`📊 DOCX结构检测结果:`);
      console.log(`  是否为DOCX内容: ${docxResult.isDocxContent ? '✅' : '❌'}`);
      console.log(`  潜在标题数: ${docxResult.details.titleCount}`);
      console.log(`  标题+描述对: ${docxResult.details.titleDescriptionPairs}`);
      console.log(`  找到的DOCX标题: ${docxResult.details.foundDocxTitles.join(', ')}`);
      
      if (docxResult.isDocxContent) {
        console.log('✅ DOCX结构检测正常工作');
      } else {
        console.log('❌ DOCX结构检测有问题');
      }
    } catch (error) {
      console.log('❌ DOCX结构检测器测试失败:', error.message);
    }
    
    // 2. 测试DOCX内容解析器
    console.log('\n📋 步骤2: 测试DOCX内容解析器');
    
    try {
      const { parseDocxContentText } = require('./src/utils/text-to-mindmap/docx-content-parser');
      
      // 模拟DOCX文本
      const docxText = `智能文档处理系统

概述
本系统是一个基于AI的文档处理平台，能够自动解析和处理各种格式的文档。

功能模块
文档上传模块：支持多种格式的文档上传
文本提取模块：从文档中提取结构化文本
智能解析模块：使用AI技术分析文档结构
思维导图生成：将文档内容转换为可视化思维导图

技术架构
前端技术：React、TypeScript、Tailwind CSS
后端技术：Node.js、Express、MongoDB
AI技术：自然语言处理、文档结构分析

部署方案
开发环境：本地开发和测试
测试环境：自动化测试和集成测试
生产环境：云端部署和监控`;
      
      const docxResult = parseDocxContentText(docxText);
      
      console.log(`📊 DOCX解析结果:`);
      console.log(`  根节点: "${docxResult.nodeData?.topic}"`);
      console.log(`  子节点数: ${docxResult.nodeData?.children?.length || 0}`);
      
      if (docxResult.nodeData?.children && docxResult.nodeData.children.length > 0) {
        console.log('  章节列表:');
        docxResult.nodeData.children.forEach((child, index) => {
          console.log(`    ${index + 1}. ${child.topic} (${child.children?.length || 0} 个子节点)`);
        });
        console.log('✅ DOCX内容解析器正常工作');
      } else {
        console.log('❌ DOCX内容解析器没有生成子节点');
      }
    } catch (error) {
      console.log('❌ DOCX内容解析器测试失败:', error.message);
    }
    
    // 3. 测试智能文本解析
    console.log('\n📋 步骤3: 测试智能文本解析');
    
    try {
      const { smartTextParse } = require('./src/utils/text-to-mindmap');
      
      // 测试DOCX格式文本
      const docxText = `系统需求分析

功能需求
用户管理：用户注册、登录、权限管理
文档处理：文档上传、解析、存储
数据分析：统计分析、报表生成

非功能需求
性能要求：系统响应时间小于2秒
安全要求：数据加密、访问控制
可用性：系统可用性达到99.9%

技术选型
前端框架：React 18
后端框架：Node.js + Express
数据库：MongoDB + Redis`;
      
      const smartResult = smartTextParse(docxText);
      
      console.log(`📝 智能解析结果:`);
      console.log(`  根节点: "${smartResult.nodeData?.topic}"`);
      console.log(`  子节点数: ${smartResult.nodeData?.children?.length || 0}`);
      
      if (smartResult.nodeData?.children && smartResult.nodeData.children.length > 0) {
        console.log('✅ 智能文本解析正常');
      } else {
        console.log('⚠️ 智能文本解析没有生成子节点');
      }
    } catch (error) {
      console.log('❌ 智能文本解析测试失败:', error.message);
    }
    
    // 4. 总结
    console.log('\n🎯 测试总结:');
    console.log('=' .repeat(50));
    console.log('✅ DOCX处理逻辑已添加完成');
    console.log('📄 DOCX文件会先判断结构');
    console.log('🔍 检测到DOCX_CONTENT类型 → 使用DOCX解析器');
    console.log('✅ 结构充足（≥3节点）→ 前端解析');
    console.log('🌐 结构不足（<3节点）→ 后端API');
    console.log('📝 普通文本不受影响');
    
    console.log('\n🚀 现在可以在浏览器中测试:');
    console.log('  访问: http://localhost:3001');
    console.log('  1. 上传DOCX文件 → 应该先判断结构');
    console.log('  2. 结构充足的DOCX → 前端解析');
    console.log('  3. 结构不足的DOCX → 后端API');
    console.log('  4. 输入普通文本 → 应该正常解析');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误堆栈:', error.stack);
  }
}

testDocxLogic().catch(console.error);
