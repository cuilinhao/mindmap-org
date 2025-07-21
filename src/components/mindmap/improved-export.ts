// 改进的导出图片函数
export const improvedExportImage = async (
  mindInstance: any,
  mapRef: React.RefObject<HTMLDivElement>,
  t: (key: string) => string
) => {
  if (!mindInstance.current) {
    console.warn('Mind-Elixir 实例不存在，无法导出');
    return;
  }
  
  try {
    // 动态导入 @ssshooter/modern-screenshot
    const { domToPng } = await import('@ssshooter/modern-screenshot');
    
    // 获取思维导图的 DOM 节点
    const mindMapContainer = mapRef.current;
    if (!mindMapContainer) {
      throw new Error('无法找到思维导图容器');
    }

    // 查找思维导图的SVG元素
    const svgElement = mindMapContainer.querySelector('svg');
    if (!svgElement) {
      throw new Error('无法找到思维导图的SVG元素');
    }

    // 重置视图到适合导出的状态
    if (mindInstance.current.refresh) {
      mindInstance.current.refresh();
    }
    
    // 等待重新渲染完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 获取所有节点元素，包括连接线
    const nodeElements = mindMapContainer.querySelectorAll('.map-container .node, .map-container .line');
    
    // 计算所有节点的边界框
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodeElements.forEach((nodeEl: Element) => {
      const rect = nodeEl.getBoundingClientRect();
      const containerRect = mindMapContainer.getBoundingClientRect();
      
      // 计算相对于容器的位置
      const relativeLeft = rect.left - containerRect.left;
      const relativeTop = rect.top - containerRect.top;
      const relativeRight = relativeLeft + rect.width;
      const relativeBottom = relativeTop + rect.height;
      
      minX = Math.min(minX, relativeLeft);
      minY = Math.min(minY, relativeTop);
      maxX = Math.max(maxX, relativeRight);
      maxY = Math.max(maxY, relativeBottom);
    });
    
    // 如果没有找到节点或计算出错，回退到SVG的边界框
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      let bbox;
      try {
        bbox = svgElement.getBBox();
      } catch (e) {
        // 如果getBBox失败，使用getBoundingClientRect
        const rect = svgElement.getBoundingClientRect();
        bbox = {
          x: 0,
          y: 0,
          width: rect.width,
          height: rect.height
        };
      }
      
      minX = bbox.x;
      minY = bbox.y;
      maxX = bbox.x + bbox.width;
      maxY = bbox.y + bbox.height;
    }

    // 计算内容的实际尺寸，添加更大的边距以确保完整显示
    const padding = 150; // 增加边距，确保所有内容都能显示
    const contentWidth = Math.max(maxX - minX, 800) + padding * 2;
    const contentHeight = Math.max(maxY - minY, 600) + padding * 2;
    
    // 计算适当的缩放比例，确保导出图片不会太大也不会太小
    const maxSize = 5000; // 最大尺寸限制
    let scaleFactor = 2; // 默认缩放因子
    
    // 如果内容太大，调整缩放因子
    if (contentWidth > maxSize || contentHeight > maxSize) {
      const widthRatio = maxSize / contentWidth;
      const heightRatio = maxSize / contentHeight;
      scaleFactor = Math.min(widthRatio, heightRatio, 2); // 不超过2倍缩放
    }
    
    console.log(`导出尺寸: ${contentWidth}x${contentHeight}, 缩放: ${scaleFactor}`);

    // 临时调整SVG的viewBox以确保完整内容可见
    const originalViewBox = svgElement.getAttribute('viewBox');
    const newViewBox = `${minX - padding} ${minY - padding} ${contentWidth} ${contentHeight}`;
    svgElement.setAttribute('viewBox', newViewBox);
    
    // 临时设置容器样式以适应内容
    const originalContainerStyle = {
      width: mindMapContainer.style.width,
      height: mindMapContainer.style.height,
      overflow: mindMapContainer.style.overflow
    };
    
    mindMapContainer.style.width = `${contentWidth}px`;
    mindMapContainer.style.height = `${contentHeight}px`;
    mindMapContainer.style.overflow = 'visible';

    // 等待样式应用
    await new Promise(resolve => setTimeout(resolve, 500)); // 增加等待时间

    // 导出为高质量PNG
    const dataUrl = await domToPng(mindMapContainer, {
      width: contentWidth * scaleFactor,
      height: contentHeight * scaleFactor,
      style: {
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'top left',
        width: `${contentWidth}px`,
        height: `${contentHeight}px`
      },
      pixelRatio: scaleFactor,
      quality: 1,
      backgroundColor: '#ffffff',
      // 确保能捕获所有子元素
      filter: (node) => {
        if (node instanceof HTMLElement) {
          const classList = node.classList;
          return !classList.contains('loading') && 
                 !classList.contains('error') &&
                 !classList.contains('toolbar') &&
                 !node.hasAttribute('data-exclude-from-export');
        }
        return true;
      },
      // 确保字体和样式正确渲染
      fontEmbedCSS: true,
      includeQueryParams: true,
      // 跳过不必要的元素
      skipAutoScale: true
    });

    // 恢复原始样式
    if (originalViewBox) {
      svgElement.setAttribute('viewBox', originalViewBox);
    } else {
      svgElement.removeAttribute('viewBox');
    }
    
    mindMapContainer.style.width = originalContainerStyle.width;
    mindMapContainer.style.height = originalContainerStyle.height;
    mindMapContainer.style.overflow = originalContainerStyle.overflow;
    
    // 刷新思维导图显示
    if (mindInstance.current.refresh) {
      mindInstance.current.refresh();
    }
    
    const link = document.createElement('a');
    link.download = `${t('mindmap.export.filename')}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
    console.log('图片导出成功');
  } catch (error) {
    console.error('图片导出失败:', error);
    alert('图片导出失败，请检查控制台获取详细信息');
  }
};