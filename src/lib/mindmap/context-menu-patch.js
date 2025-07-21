/**
 * 这个文件用于修补 Mind-Elixir 的右键菜单，确保它能够正确显示中文
 */

// 在文档加载完成后执行
if (typeof window !== 'undefined') {
  // 创建一个函数来处理右键菜单的翻译
  const patchContextMenu = () => {
    // 中文菜单项映射
    const menuTextMap = {
      'Add child': '插入子节点',
      'Add sibling': '插入同级节点',
      'Focus': '专注',
      'Cancel focus mode': '取消专注',
      'Summary': '摘要',
      'Link': '连接',
      'Bi-directional link': '双向连接',
      'Delete': '删除',
      'Edit': '编辑',
      'Style': '样式',
      'Copy': '复制',
      'Paste': '粘贴'
    };

    // 创建一个 MutationObserver 来监听文档变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // 查找右键菜单
          const contextMenu = document.querySelector('.mind-elixir-context-menu');
          if (contextMenu) {
            // 检查当前语言
            const lang = document.documentElement.lang || localStorage.getItem('language') || 'en';
            
            // 如果是中文，修改菜单项文本
            if (lang === 'zh') {
              // 修改菜单项文本
              const menuItems = contextMenu.querySelectorAll('li');
              menuItems.forEach((item) => {
                const text = item.textContent?.trim();
                if (text && menuTextMap[text]) {
                  item.textContent = menuTextMap[text];
                }
              });
            }
          }
        }
      });
    });
    
    // 开始观察文档变化
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 监听鼠标右键点击事件，在右键菜单显示后尝试翻译
    const handleContextMenu = () => {
      // 检查当前语言
      const lang = document.documentElement.lang || localStorage.getItem('language') || 'en';
      
      // 如果是中文，修改菜单项文本
      if (lang === 'zh') {
        // 延迟一点时间，确保右键菜单已经创建
        setTimeout(() => {
          // 查找右键菜单
          const contextMenu = document.querySelector('.mind-elixir-context-menu');
          if (contextMenu) {
            // 修改菜单项文本
            const menuItems = contextMenu.querySelectorAll('li');
            menuItems.forEach((item) => {
              const text = item.textContent?.trim();
              if (text && menuTextMap[text]) {
                item.textContent = menuTextMap[text];
              }
            });
          }
        }, 50);
        
        // 再次延迟，以防菜单创建较慢
        setTimeout(() => {
          // 查找右键菜单
          const contextMenu = document.querySelector('.mind-elixir-context-menu');
          if (contextMenu) {
            // 修改菜单项文本
            const menuItems = contextMenu.querySelectorAll('li');
            menuItems.forEach((item) => {
              const text = item.textContent?.trim();
              if (text && menuTextMap[text]) {
                item.textContent = menuTextMap[text];
              }
            });
          }
        }, 200);
      }
    };
    
    // 添加右键点击事件监听器
    document.addEventListener('contextmenu', handleContextMenu);
  };

  // 在文档加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchContextMenu);
  } else {
    patchContextMenu();
  }
}