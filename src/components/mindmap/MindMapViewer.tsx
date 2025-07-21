import React, { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Edit, Maximize } from 'lucide-react';

// 导入 ReactFlowMindMapData 类型
import { ReactFlowMindMapData } from '@/types/mindmap';

interface MindMapViewerProps {
  data: ReactFlowMindMapData;
  onClose?: () => void;
  onEdit?: () => void;
}

// 自定义节点组件
const CustomNode = ({ data }: { data: { 
  content: string; 
  type: string; 
  style?: { 
    backgroundColor?: string; 
    borderColor?: string; 
    textColor?: string; 
    fontSize?: number; 
  }; 
  summary?: string; 
  fullText?: string; 
} }) => {
  const { content, type, style, summary, fullText } = data;
  
  const getNodeContent = () => {
    if (type === 'root') {
      return content;
    }
    if (type === 'topic') {
      return summary || content;
    }
    // paragraph节点显示摘要，悬停显示完整内容
    return content.length > 60 ? `${content.substring(0, 60)}...` : content;
  };

  return (
    <div
      className="px-4 py-2 rounded-lg border-2 shadow-lg min-w-[120px] max-w-[300px] text-center"
      style={{
        backgroundColor: style?.backgroundColor || '#ffffff',
        borderColor: style?.borderColor || '#d1d5db',
        color: style?.textColor || '#000000',
        fontSize: `${style?.fontSize || 12}px`,
      }}
      title={fullText || content}
    >
      <div className="font-medium break-words">
        {getNodeContent()}
      </div>
      {summary && type === 'topic' && (
        <div className="text-xs mt-1 opacity-80">
          {summary.length > 50 ? `${summary.substring(0, 50)}...` : summary}
        </div>
      )}
    </div>
  );
};

// 节点类型定义
const nodeTypes = {
  custom: CustomNode,
};

export function MindMapViewer({ data, onClose, onEdit }: MindMapViewerProps) {
  // 转换数据为React Flow格式
  const initialNodes: Node[] = useMemo(() => {
    return data.nodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        content: node.content,
        type: node.type,
        style: node.style,
        summary: node.summary,
        fullText: node.fullText || node.content,
      },
      style: {
        width: 'auto',
      },
    }));
  }, [data.nodes]);

  const initialEdges: Edge[] = useMemo(() => {
    return data.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
      animated: false,
      style: edge.style,
    }));
  }, [data.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // 处理导出功能
  const handleExport = () => {
    const mindMapJson = JSON.stringify(data, null, 2);
    const blob = new Blob([mindMapJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title || '思维导图'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 头部工具栏 */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-gray-900 truncate">{data.title}</h1>
          <p className="text-xs text-gray-600">
            {data.metadata.statistics.nodeCount} 个节点 · 
            {data.metadata.statistics.topicCount} 个主题
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              返回
            </Button>
          )}
        </div>
      </div>

      {/* 思维导图主区域 */}
      <div className="flex-1 relative min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          className="bg-gray-50"
        >
          {/* 自定义工具栏 */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white p-1 rounded-md shadow-md border border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit && onEdit()}
              title="编辑思维导图"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                // 全屏功能实现 - 只全屏思维导图画布
                const reactFlowContainer = document.querySelector('.react-flow');
                if (!reactFlowContainer) return;

                if (!document.fullscreenElement) {
                  reactFlowContainer.requestFullscreen().catch(err => {
                    console.error(`全屏错误: ${err.message}`);
                  });
                } else {
                  document.exitFullscreen();
                }
              }}
              title={isFullscreen ? "退出全屏" : "全屏"}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* ReactFlow 原生控制组件 */}
          <Controls
            className="bg-white border border-gray-300 rounded"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
          
          <MiniMap 
            className="bg-white border border-gray-300 rounded"
            nodeStrokeColor={(n: Node) => (n.data as { style?: { borderColor?: string } })?.style?.borderColor || '#d1d5db'}
            nodeColor={(n: Node) => (n.data as { style?: { backgroundColor?: string } })?.style?.backgroundColor || '#ffffff'}
            position="bottom-left"
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#e5e7eb"
          />
        </ReactFlow>
      </div>
    </div>
  );
} 