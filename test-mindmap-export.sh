#!/bin/bash

# 确保应用正在运行
echo "确保应用已经在运行中..."

# 安装Playwright（如果尚未安装）
if ! npx playwright --version &> /dev/null; then
  echo "安装Playwright..."
  npm install -D @playwright/test
  npx playwright install --with-deps chromium
fi

# 创建下载目录
mkdir -p tests/downloads

# 运行测试
echo "开始运行测试..."
npx playwright test tests/mindmap-export-visual.spec.ts --headed

# 显示测试结果
echo "测试完成，查看测试结果..."
echo "下载的图片保存在: $(pwd)/tests/downloads/"

# 如果系统支持，打开下载目录
if [[ "$OSTYPE" == "darwin"* ]]; then
  open tests/downloads/
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open tests/downloads/ &> /dev/null || echo "请手动查看下载目录"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  start tests/downloads/
fi