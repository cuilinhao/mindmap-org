/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
// 在客户端组件中导入CSS
import '@/styles/mindmap-custom.css';
// 导入右键菜单补丁
import '@/lib/mindmap/context-menu-patch.js';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, ZoomIn, ZoomOut, ArrowLeft, Image, FileText, FileJson, Save, Plus, Trash, Eye, Maximize } from 'lucide-react';
import type { MindElixirData, MindElixirNode } from '@/types/mindmap';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface MindElixirViewerProps {
  data: MindElixirData;
  onClose?: () => void;
  onSave?: (data: MindElixirData) => void;
  onViewMode?: () => void; // 添加切换到查看模式的回调
}

// 动态导入 Mind-Elixir，避免 SSR 问题
let MindElixir: unknown = null;

const loadMindElixir = async () => {
  if (typeof window !== 'undefined' && !MindElixir) {
    try {
      const mindElixirModule = await import('mind-elixir');
      MindElixir = mindElixirModule.default || mindElixirModule;
    } catch (error) {
      console.error('Mind-Elixir 加载失败:', error);
      throw error;
    }
  }
  return MindElixir;
};

// 验证和规范化思维导图数据
const validateAndNormalizeMindMapData = (data: MindElixirData): any => {
  if (!data || !data.nodeData) {
    throw new Error('无效的思维导图数据：缺少 nodeData');
  }

  const normalizeNode = (node: any): any => {
    if (!node.topic || !node.id) {
      throw new Error('无效的节点数据：缺少 topic 或 id');
    }

    const normalizedNode: any = {
      topic: String(node.topic).trim(),
      id: String(node.id),
      children: [],
      // Mind-Elixir 需要的额外属性
      style: node.style || {}
      // 移除 parent 属性以避免循环引用
    };

    // 处理子节点
    if (node.children && Array.isArray(node.children)) {
      normalizedNode.children = node.children.map((child: any) => {
        const normalizedChild = normalizeNode(child);
        // 不设置 parent 属性，避免循环引用
        return normalizedChild;
      });
    }

    return normalizedNode;
  };

  try {
    const normalizedData = {
      nodeData: normalizeNode(data.nodeData),
      linkData: data.linkData || {}
    };

    // 确保根节点有正确的结构
    normalizedData.nodeData.root = true;

    return normalizedData;
  } catch (error) {
    console.error('数据规范化失败:', error);
    // 创建一个安全的默认数据结构
    return createSafeDefaultData(data);
  }
};

// 创建安全的默认数据结构
const createSafeDefaultData = (originalData: MindElixirData, defaultTitle = '思维导图'): any => {
  const defaultData = {
    nodeData: {
      topic: originalData.nodeData?.topic || defaultTitle,
      id: 'root',
      children: [],
      style: {},
      root: true
    },
    linkData: {}
  };

  // 如果原始数据有子节点，尝试转换
  if (originalData.nodeData?.children && Array.isArray(originalData.nodeData.children)) {
    let nodeIdCounter = 1;
    const convertChildren = (children: any[]): any[] => {
      return children.map((child, index) => {
        const nodeId = child.id || `node-${nodeIdCounter++}`;
        const convertedChild = {
          topic: String(child.topic || `节点 ${index + 1}`).trim(),
          id: nodeId,
          children: [],
          style: {}
          // 移除 parent 属性以避免循环引用
        };

        if (child.children && Array.isArray(child.children)) {
          convertedChild.children = convertChildren(child.children);
          // 不设置 parent 属性，避免循环引用
        }

        return convertedChild;
      });
    };

    defaultData.nodeData.children = convertChildren(originalData.nodeData.children);
    // 不设置 parent 属性，避免循环引用
  }

  return defaultData;
};

export function MindElixirViewer({ data, onClose, onSave, onViewMode }: MindElixirViewerProps) {
  // 使用 useRef 获取 DOM 元素
  const mapRef = useRef<HTMLDivElement>(null);
  const mindInstance = useRef<any>(null);
  const { t, language } = useLanguage();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentScale, setCurrentScale] = useState(1); // 添加缩放级别状态
  
  // 重写 createSafeDefaultData 函数，使用翻译的默认标题
  const createSafeDefaultDataWithTranslation = (originalData: MindElixirData): any => {
    return createSafeDefaultData(originalData, t('mindmap.defaultTitle'));
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 监听右键菜单的创建和显示
  useEffect(() => {
    // 创建一个函数来处理右键菜单的翻译
    const translateContextMenu = () => {
      // 查找右键菜单
      const contextMenu = document.querySelector('.mind-elixir-context-menu');
      if (contextMenu) {
        // 修改菜单项文本
        const menuItems = contextMenu.querySelectorAll('li');
        
        // 创建一个映射表，将菜单项文本映射到翻译键
        const menuTextToTranslationKey: Record<string, string> = {
          // 英文菜单项
          'Add child': 'mindmap.contextMenu.addChild',
          'Add sibling': 'mindmap.contextMenu.addSibling',
          'Focus': 'mindmap.contextMenu.focus',
          'Cancel focus mode': 'mindmap.contextMenu.unfocus',
          'Summary': 'mindmap.contextMenu.summary',
          'Link': 'mindmap.contextMenu.link',
          'Bi-directional link': 'mindmap.contextMenu.bidirectionalLink',
          'Delete': 'mindmap.contextMenu.delete',
          'Edit': 'mindmap.contextMenu.edit',
          'Style': 'mindmap.contextMenu.style',
          'Copy': 'mindmap.contextMenu.copy',
          'Paste': 'mindmap.contextMenu.paste',
          
          // 中文菜单项
          '插入子节点': 'mindmap.contextMenu.addChild',
          '插入同级节点': 'mindmap.contextMenu.addSibling',
          '专注': 'mindmap.contextMenu.focus',
          '取消专注': 'mindmap.contextMenu.unfocus',
          '摘要': 'mindmap.contextMenu.summary',
          '连接': 'mindmap.contextMenu.link',
          '双向连接': 'mindmap.contextMenu.bidirectionalLink',
          '删除': 'mindmap.contextMenu.delete',
          '编辑': 'mindmap.contextMenu.edit',
          '样式': 'mindmap.contextMenu.style',
          '复制': 'mindmap.contextMenu.copy',
          '粘贴': 'mindmap.contextMenu.paste'
        };
        
        // 遍历菜单项，根据当前文本查找对应的翻译键，并替换为翻译后的文本
        menuItems.forEach((item) => {
          const text = item.textContent?.trim();
          if (text && menuTextToTranslationKey[text]) {
            const translationKey = menuTextToTranslationKey[text];
            item.textContent = t(translationKey);
          }
        });
      }
    };
    
    // 创建一个 MutationObserver 来监听文档变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // 尝试翻译右键菜单
          translateContextMenu();
        }
      });
    });
    
    // 开始观察文档变化
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 监听鼠标右键点击事件，在右键菜单显示后尝试翻译
    const handleContextMenu = () => {
      // 延迟一点时间，确保右键菜单已经创建
      setTimeout(translateContextMenu, 50);
      // 再次延迟，以防菜单创建较慢
      setTimeout(translateContextMenu, 200);
    };
    
    // 添加右键点击事件监听器
    document.addEventListener('contextmenu', handleContextMenu);
    
    // 清理函数
    return () => {
      observer.disconnect();
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [t, language]); // 依赖于 t 和 language，确保语言切换时重新运行

  // 当组件挂载且数据准备好时初始化 Mind-Elixir
  useEffect(() => {
    if (!data) {
      return;
    }

    let isMounted = true;

    const initializeMindElixir = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // 等待 DOM 渲染完成
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!isMounted) {
          return;
        }

        // 确保容器存在
        const container = mapRef.current;
        if (!container) {
          throw new Error('容器元素不存在');
        }

        // 销毁之前的实例（如果存在）
        if (mindInstance.current) {
          if (mindInstance.current.destroy) {
            mindInstance.current.destroy();
          }
          mindInstance.current = null;
        }

        // 加载 Mind-Elixir 库
        const MindElixirClass = await loadMindElixir();
        if (!MindElixirClass) {
          throw new Error('Mind-Elixir 库加载失败');
        }
        
        // 自定义 Mind-Elixir 的本地化文件
        if (language === 'en' && (MindElixirClass as any).i18n) {
          try {
            // 尝试添加或修改英文本地化
            (MindElixirClass as any).i18n.en = {
              ...(MindElixirClass as any).i18n.en,
              addChild: t('mindmap.contextMenu.addChild'),
              addSibling: t('mindmap.contextMenu.addSibling'),
              focus: t('mindmap.contextMenu.focus'),
              unfocus: t('mindmap.contextMenu.unfocus'),
              summary: t('mindmap.contextMenu.summary'),
              link: t('mindmap.contextMenu.link'),
              'bi-link': t('mindmap.contextMenu.bidirectionalLink'),
              delete: t('mindmap.contextMenu.delete'),
              edit: t('mindmap.contextMenu.edit'),
              style: t('mindmap.contextMenu.style'),
              copy: t('mindmap.contextMenu.copy'),
              paste: t('mindmap.contextMenu.paste')
            };
          } catch (e) {
            console.warn('无法自定义 Mind-Elixir 的本地化文件:', e);
          }
        }

        // 清空容器并设置样式
        container.innerHTML = '';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.minHeight = '400px';

        // Mind-Elixir 配置 - 使用彩色节点和放射状布局，类似截图中的样式
        const options = {
          el: container,
          direction: 2,              // 使用放射状布局 (2 = both sides)
          draggable: true,
          contextMenu: true,
          toolBar: true,
          nodeMenu: true,
          keypress: true,
          locale: language === 'zh' ? 'zh_CN' : 'en', // 根据当前语言选择相应的 locale
          minScale: 0.1,             // 设置最小缩放比例为 0.1（允许缩小到原始大小的 10%）
          
          // 自定义右键菜单文本
          contextMenuOption: {
            add: language === 'zh' ? '插入子节点' : 'Add child',
            addSibling: language === 'zh' ? '插入同级节点' : 'Add sibling',
            focus: language === 'zh' ? '专注' : 'Focus',
            unfocus: language === 'zh' ? '取消专注' : 'Cancel focus mode',
            summary: language === 'zh' ? '摘要' : 'Summary',
            link: language === 'zh' ? '连接' : 'Link',
            biLink: language === 'zh' ? '双向连接' : 'Bi-directional link',
            delete: language === 'zh' ? '删除' : 'Delete',
            edit: language === 'zh' ? '编辑' : 'Edit',
            style: language === 'zh' ? '样式' : 'Style',
            copy: language === 'zh' ? '复制' : 'Copy',
            paste: language === 'zh' ? '粘贴' : 'Paste'
          },
          overflowHidden: false,
          mainLinkStyle: 3,          // 使用曲线连接线 (3 = curve)
          mainNodeVerticalGap: 15,   // 减小垂直间距
          mainNodeHorizontalGap: 30, // 减小水平间距
          linkCurvature: 0.6,        // 增加曲线弯曲度，使连接线更短更弯曲
          // 启用编辑功能
          allowEdit: true,           // 允许编辑节点内容
          allowAddChild: true,       // 允许添加子节点
          allowAddSibling: true,     // 允许添加兄弟节点
          allowDelete: true,         // 允许删除节点
          allowDrag: true,           // 允许拖拽节点
          allowEditTags: true,       // 允许编辑标签
          allowEditStyle: true,      // 允许编辑样式
          // 自定义主题
          theme: {
            name: 'colorful',        // 使用彩色主题
            randomColor: false,      // 禁用随机颜色，使用固定颜色方案
            // 不同层级使用不同颜色
            palette: [
              '#2F9BFF',  // 蓝色 - 第一层
              '#4CAF50',  // 绿色 - 第二层
              '#FF5722',  // 红色 - 第三层
              '#FF9800',  // 橙色 - 第四层
              '#9C27B0',  // 紫色 - 第五层
              '#795548',  // 棕色 - 第六层
            ],
            // 为不同层级设置不同的边框颜色
            borderColors: [
              '#2F9BFF',  // 蓝色边框 - 第一层
              '#4CAF50',  // 绿色边框 - 第二层
              '#FF5722',  // 红色边框 - 第三层
              '#FF9800',  // 橙色边框 - 第四层
              '#9C27B0',  // 紫色边框 - 第五层
              '#795548',  // 棕色边框 - 第六层
            ],
            // 自定义CSS变量
            cssVar: {
              '--main-color': '#2F9BFF',
              '--main-bgcolor': '#ffffff',
              '--color': '#333333',
              '--bgcolor': '#ffffff',
              '--border-color': '#FF5722',  // 使用更明显的边框颜色（红色）
              '--border-width': '2px',      // 增加边框宽度，使边框更明显
              '--node-border-radius': '8px', // 设置圆角大小
              '--node-padding': '10px 15px',
              '--root-color': '#ffffff',
              '--root-bgcolor': '#2F9BFF',
              '--root-border-color': '#2F9BFF', // 根节点边框颜色
              '--root-border-width': '2px',     // 根节点边框宽度
              '--root-border-radius': '8px',    // 根节点圆角
              '--root-padding': '12px 20px',
            }
          },
          // 自定义布局
          layout: {
            hGap: 80,                // 减小水平间距，使节点更靠近，连接线更短
            vGap: 40,                // 减小垂直间距，使节点更靠近，连接线更短
            direction: 2,            // 放射状布局
            getSide: (node: any) => {
              // 根据节点内容或ID决定节点在左侧还是右侧
              // 这里简单地将节点平均分配到左右两侧
              if (!node.parent) return 'right'; // 根节点
              
              // 获取节点在父节点中的索引
              const parentNode = node.parent;
              const siblings = parentNode.children || [];
              const index = siblings.findIndex((child: any) => child.id === node.id);
              
              // 奇数索引在右侧，偶数索引在左侧
              return index % 2 === 0 ? 'right' : 'left';
            }
          }
        };

        // 创建 Mind-Elixir 实例
        mindInstance.current = new (MindElixirClass as any)(options);
        
        // 直接修改 Mind-Elixir 实例的本地化设置
        if (language === 'en' && mindInstance.current && mindInstance.current.locale) {
          try {
            // 尝试修改英文本地化
            const customLocale = {
              addChild: t('mindmap.contextMenu.addChild'),
              addSibling: t('mindmap.contextMenu.addSibling'),
              focus: t('mindmap.contextMenu.focus'),
              unfocus: t('mindmap.contextMenu.unfocus'),
              summary: t('mindmap.contextMenu.summary'),
              link: t('mindmap.contextMenu.link'),
              'bi-link': t('mindmap.contextMenu.bidirectionalLink'),
              delete: t('mindmap.contextMenu.delete'),
              edit: t('mindmap.contextMenu.edit'),
              style: t('mindmap.contextMenu.style'),
              copy: t('mindmap.contextMenu.copy'),
              paste: t('mindmap.contextMenu.paste')
            };
            
            // 将自定义本地化设置合并到 Mind-Elixir 实例的本地化设置中
            Object.assign(mindInstance.current.locale, customLocale);
          } catch (e) {
            console.warn('无法修改 Mind-Elixir 实例的本地化设置:', e);
          }
        }
        
        // 验证和规范化数据格式
        // 使用自定义函数，确保使用翻译的默认标题
        const validatedData = validateAndNormalizeMindMapData(data);
        
        // 如果根节点的标题是默认的"思维导图"，则替换为翻译版本
        if (validatedData.nodeData && validatedData.nodeData.topic === '思维导图') {
          validatedData.nodeData.topic = t('mindmap.defaultTitle');
        }
        
        console.log('验证后的数据结构:', {
          hasNodeData: !!validatedData.nodeData,
          rootTopic: validatedData.nodeData?.topic,
          childrenCount: validatedData.nodeData?.children?.length || 0
        });

        // 初始化数据
        mindInstance.current.init(validatedData);
        
        // 重置缩放级别
        setCurrentScale(1);
        

        
        // 添加自定义CSS类到容器
        container.classList.add('mind-elixir-custom');
        
        // 在初始化后应用自定义样式和处理逻辑
        setTimeout(() => {
          // 为叶子节点（没有子节点的节点）添加特殊类名
          const applyLeafNodeStyles = () => {
            if (!container) return;
            
            // 查找所有节点
            const nodeElements = container.querySelectorAll('.map-container .node');
            
            nodeElements.forEach((nodeEl: Element) => {
              // 检查是否有子节点
              const hasChildren = nodeEl.querySelector('.children');
              const nodeBox = nodeEl.querySelector('.node-box');
              
              if (!hasChildren || (hasChildren && !hasChildren.children.length)) {
                // 这是一个叶子节点，添加特殊类名
                nodeEl.classList.add('leaf-node');
                if (nodeBox) {
                  nodeBox.classList.add('box-leaf');
                }
              }
              
              // 根据节点深度添加层级类名
              const depth = parseInt(nodeEl.getAttribute('data-depth') || '0', 10);
              if (nodeBox && depth > 0) {
                nodeBox.classList.add(`level-${depth}`);
              }
            });
          };
          
          // 自定义右键菜单文本
          const customizeContextMenu = () => {
            // 监听右键菜单的创建，无论是英文还是中文界面
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                  // 查找右键菜单
                  const contextMenu = document.querySelector('.mind-elixir-context-menu');
                  if (contextMenu) {
                    // 修改菜单项文本
                    const menuItems = contextMenu.querySelectorAll('li');
                    
                    // 创建一个映射表，将菜单项文本映射到翻译键
                    const menuTextToTranslationKey: Record<string, string> = {
                      // 英文菜单项
                      'Add child': 'mindmap.contextMenu.addChild',
                      'Add sibling': 'mindmap.contextMenu.addSibling',
                      'Focus': 'mindmap.contextMenu.focus',
                      'Cancel focus mode': 'mindmap.contextMenu.unfocus',
                      'Summary': 'mindmap.contextMenu.summary',
                      'Link': 'mindmap.contextMenu.link',
                      'Bi-directional link': 'mindmap.contextMenu.bidirectionalLink',
                      'Delete': 'mindmap.contextMenu.delete',
                      'Edit': 'mindmap.contextMenu.edit',
                      'Style': 'mindmap.contextMenu.style',
                      'Copy': 'mindmap.contextMenu.copy',
                      'Paste': 'mindmap.contextMenu.paste',
                      
                      // 中文菜单项
                      '插入子节点': 'mindmap.contextMenu.addChild',
                      '插入同级节点': 'mindmap.contextMenu.addSibling',
                      '专注': 'mindmap.contextMenu.focus',
                      '取消专注': 'mindmap.contextMenu.unfocus',
                      '摘要': 'mindmap.contextMenu.summary',
                      '连接': 'mindmap.contextMenu.link',
                      '双向连接': 'mindmap.contextMenu.bidirectionalLink',
                      '删除': 'mindmap.contextMenu.delete',
                      '编辑': 'mindmap.contextMenu.edit',
                      '样式': 'mindmap.contextMenu.style',
                      '复制': 'mindmap.contextMenu.copy',
                      '粘贴': 'mindmap.contextMenu.paste'
                    };
                    
                    // 遍历菜单项，根据当前文本查找对应的翻译键，并替换为翻译后的文本
                    menuItems.forEach((item) => {
                      const text = item.textContent?.trim();
                      if (text && menuTextToTranslationKey[text]) {
                        const translationKey = menuTextToTranslationKey[text];
                        item.textContent = t(translationKey);
                      }
                    });
                  }
                }
              });
            });
            
            // 开始观察文档变化
            observer.observe(document.body, { childList: true, subtree: true });
          };
          
          // 应用样式
          applyLeafNodeStyles();
          
          // 自定义右键菜单
          customizeContextMenu();
          
          // 监听节点变化，重新应用样式
          mindInstance.current.bus.addListener('operation', () => {
            setTimeout(applyLeafNodeStyles, 100);
          });
          

          
        }, 500);
        
        setIsInitializing(false);

      } catch (error) {
        console.error('Mind-Elixir 初始化失败:', error);
        setError(`Mind-Elixir 初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
        setIsInitializing(false);
      }
    };

    // 立即开始初始化
    initializeMindElixir();

    // 清理函数
    return () => {
      isMounted = false;
      if (mindInstance.current) {
        if (mindInstance.current.destroy) {
          mindInstance.current.destroy();
        }
        mindInstance.current = null;
      }
    };
  }, [data, language, t]); // 添加缺少的依赖

  // 导出为 JSON
  const handleExportJSON = () => {
    if (!mindInstance.current) {
      console.warn('Mind-Elixir 实例不存在，无法导出');
      return;
    }
    
    try {
      // 使用正确的 Mind-Elixir API
      const mindMapData = mindInstance.current.getData();
      const mindMapJson = JSON.stringify(mindMapData, null, 2);
      const blob = new Blob([mindMapJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${t('mindmap.export.filename')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('JSON 导出成功');
    } catch (error) {
      console.error('JSON 导出失败:', error);
      alert('JSON 导出失败，请检查控制台获取详细信息');
    }
  };

  // 导出为图片
  const handleExportImage = async () => {
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

  // 导出为 Markdown
  const handleExportMarkdown = () => {
    if (!mindInstance.current) {
      console.warn('Mind-Elixir 实例不存在，无法导出');
      return;
    }
    
    try {
      // 获取数据并手动转换为 Markdown
      const mindMapData = mindInstance.current.getData();
      const markdownContent = convertToMarkdown(mindMapData);
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${t('mindmap.export.filename')}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Markdown 导出成功');
    } catch (error) {
      console.error('Markdown 导出失败:', error);
      alert('Markdown 导出失败，请检查控制台获取详细信息');
    }
  };

  // 手动转换为 Markdown 格式
  const convertToMarkdown = (data: any): string => {
    const convertNode = (node: any, depth: number = 1): string => {
      let markdown = `${'#'.repeat(depth)} ${node.topic}\n\n`;
      
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          markdown += convertNode(child, depth + 1);
        }
      }
      
      return markdown;
    };

    if (data && data.nodeData) {
      return convertNode(data.nodeData);
    }
    
    return `# ${t('mindmap.defaultTitle')}\n\n导出失败：数据格式不正确\n`;
  };

  const handleReset = () => {
    if (mindInstance.current) {
      // 使用 Mind-Elixir 原生的重置功能
      mindInstance.current.refresh();
      setCurrentScale(1);
      console.log('已重置思维导图');
    }
  };

  const handleZoomIn = () => {
    if (mindInstance.current && mindInstance.current.scale) {
      // 使用 Mind-Elixir 原生的缩放功能
      mindInstance.current.scale(1.2);
    }
  };

  const handleZoomOut = () => {
    if (mindInstance.current && mindInstance.current.scale) {
      // 使用 Mind-Elixir 原生的缩放功能
      mindInstance.current.scale(0.8);
    }
  };

  // 总是渲染思维导图界面，但在加载/错误时显示遮罩
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center flex-shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-gray-900">{t('mindmap.title')}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => {
            // 全屏功能实现 - 只全屏思维导图画布
            const mindMapContainer = mapRef.current;
            if (!mindMapContainer) return;
            
            if (!document.fullscreenElement) {
              mindMapContainer.requestFullscreen().catch(err => {
                console.error(`全屏错误: ${err.message}`);
              });
            } else {
              document.exitFullscreen();
            }
          }} disabled={isInitializing} title={isFullscreen ? (t('mindmap.controls.exitFullscreen') || "退出全屏") : (t('mindmap.controls.fullscreen') || "全屏")}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={isInitializing} title={t('mindmap.controls.zoomOut')}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={isInitializing} title={t('mindmap.controls.zoomIn')}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isInitializing} title={t('mindmap.controls.reset')}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {/* 编辑按钮组 */}
          {onSave && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (mindInstance.current) {
                    const updatedData = mindInstance.current.getData();
                    onSave(updatedData);
                  }
                }} 
                disabled={isInitializing}
                title={t('mindmap.edit.save')}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Save className="h-4 w-4" />
              </Button>
              {onViewMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewMode} 
                  disabled={isInitializing}
                  title={t('mindmap.edit.viewMode')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
          
          {/* 导出按钮组 */}
          <Button variant="outline" size="sm" onClick={handleExportJSON} disabled={isInitializing} title={t('mindmap.export.json')}>
            <FileJson className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMarkdown} disabled={isInitializing} title={t('mindmap.export.markdown')}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportImage} disabled={isInitializing} title={t('mindmap.export.image')}>
            <Image className="h-4 w-4" />
          </Button>
          
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('mindmap.controls.back')}
            </Button>
          )}
        </div>
      </div>

      {/* 编辑提示 */}
      {onSave && !isInitializing && (
        <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700 border-b border-blue-100">
          <p className="font-medium mb-1">{t('mindmap.edit.title')}</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>{t('mindmap.edit.tips.doubleClick')}</li>
            <li>{t('mindmap.edit.tips.rightClick')}</li>
            <li>{t('mindmap.edit.tips.drag')}</li>
            <li>{t('mindmap.edit.tips.save')}</li>
          </ul>
        </div>
      )}
      
      {/* 思维导图容器 */}
      <div className="flex-1 relative">
        {/* 思维导图容器 - 总是渲染 */}
        <div 
          ref={mapRef}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
        
        {/* 加载状态遮罩 */}
        {isInitializing && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('mindmap.loading')}</p>
            </div>
          </div>
        )}
        
        {/* 错误状态遮罩 */}
        {error && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
            <div className="max-w-md w-full px-4 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">{t('mindmap.error')}</p>
                <p className="text-red-600 text-sm mt-2">{error}</p>
              </div>
              <Button onClick={onClose} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('mindmap.backToHome')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}