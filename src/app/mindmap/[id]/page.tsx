'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MindMapViewer } from '@/components/mindmap/MindMapViewer';
import { MindElixirViewer } from '@/components/mindmap/MindElixirViewer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// 移除不需要的导入
import { MindElixirData, MindElixirNode, ReactFlowMindMapData, ReactFlowNode, ReactFlowEdge } from '@/types/mindmap';

export default function MindMapPage() {
  const params = useParams();
  const router = useRouter();
  const [mindMapData, setMindMapData] = useState<ReactFlowMindMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadMindMapData = () => {
      try {
        // 尝试从localStorage获取最新的思维导图数据
        const latestData = localStorage.getItem('latestMindMapData');
        if (latestData) {
          const data = JSON.parse(latestData);
          setMindMapData(data);
          setLoading(false);
          return;
        }

        // 如果没有数据，显示错误
        setError('未找到思维导图数据，请重新生成');
        setLoading(false);
      } catch (err) {
        console.error('加载思维导图数据失败:', err);
        setError('加载思维导图数据失败');
        setLoading(false);
      }
    };

    loadMindMapData();
  }, [params.id]);

  const handleGoBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-blue-600" />
            <p className="text-xl text-gray-600">正在加载思维导图...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !mindMapData) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center py-16 bg-gray-50">
          <div className="max-w-md w-full px-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle>加载失败</CardTitle>
                <CardDescription>
                  无法加载思维导图数据
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error || '未找到思维导图数据，请重新生成'}
                  </AlertDescription>
                </Alert>
                <div className="text-center">
                  <Button
                    onClick={handleGoBack}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回首页
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  // 保存修改后的思维导图数据
  const handleSaveMindMap = (updatedData: ReactFlowMindMapData): void => {
    try {
      // 保存到localStorage
      localStorage.setItem('latestMindMapData', JSON.stringify(updatedData));
      // 更新状态
      setMindMapData(updatedData);
    } catch (err) {
      console.error('保存思维导图数据失败:', err);
      alert('保存失败，请重试');
    }
  };

  // 转换数据格式以适配MindElixirViewer
  const convertToMindElixirFormat = (data: ReactFlowMindMapData): MindElixirData => {
    // 如果数据已经是MindElixir格式，直接返回
    if ('nodeData' in data) {
      return data as unknown as MindElixirData;
    }

    // 从ReactFlow格式转换为MindElixir格式
    const convertNode = (node: ReactFlowNode, nodes: ReactFlowNode[], edges: ReactFlowEdge[]): MindElixirNode => {
      const children: MindElixirNode[] = [];

      // 查找所有以当前节点为source的边
      const childEdges = edges.filter(edge => edge.source === node.id);

      // 对于每条边，找到目标节点并递归转换
      for (const edge of childEdges) {
        const childNode = nodes.find(n => n.id === edge.target);
        if (childNode) {
          children.push(convertNode(childNode, nodes, edges));
        }
      }

      return {
        id: node.id,
        topic: node.data.content,
        children: children.length > 0 ? children : undefined,
        style: {
          backgroundColor: node.data.style?.backgroundColor || '#ffffff',
          color: node.data.style?.textColor || '#333333',
          fontSize: node.data.style?.fontSize || 14
        }
      };
    };

    // 找到根节点
    const rootNode = data.nodes.find(node => node.data.type === 'root');
    if (!rootNode) {
      return {
        nodeData: {
          id: 'root',
          topic: data.title || '思维导图',
          root: true,
          children: []
        }
      };
    }

    // 从根节点开始转换
    const mindElixirData = {
      nodeData: {
        ...convertNode(rootNode, data.nodes, data.edges),
        root: true
      }
    };

    return mindElixirData;
  };

  // 转换回ReactFlow格式
  const convertToReactFlowFormat = (mindElixirData: MindElixirData): ReactFlowMindMapData => {
    const nodes: ReactFlowNode[] = [];
    const edges: ReactFlowEdge[] = [];
    let nodeId = 1;
    let edgeId = 1;

    const processNode = (node: MindElixirNode, parentId: string | null = null, x = 0, y = 0): string => {
      const id = node.id || `node-${nodeId++}`;

      // 创建节点
      nodes.push({
        id,
        type: node.root ? 'root' : 'topic',
        position: { x, y },
        data: {
          content: node.topic,
          type: node.root ? 'root' : 'topic',
          style: {
            backgroundColor: node.style?.backgroundColor || '#ffffff',
            borderColor: node.style?.borderColor || '#d1d5db',
            textColor: node.style?.color || '#000000',
            fontSize: node.style?.fontSize || 14
          }
        }
      });

      // 如果有父节点，创建边
      if (parentId) {
        edges.push({
          id: `edge-${edgeId++}`,
          source: parentId,
          target: id,
          type: 'smoothstep',
          style: {
            strokeWidth: 2,
            stroke: '#6366f1'
          }
        });
      }

      // 处理子节点
      if (node.children && node.children.length > 0) {
        const childX = x + 200;
        let childY = y;
        const childrenLength = node.children.length;

        node.children.forEach((child, index) => {
          // 垂直排列子节点
          childY = y + (index - childrenLength / 2) * 100;
          processNode(child, id, childX, childY);
        });
      }

      return id;
    };

    // 从根节点开始处理
    if (mindElixirData.nodeData) {
      processNode(mindElixirData.nodeData);
    }

    return {
      title: mindElixirData.nodeData?.topic || '思维导图',
      nodes,
      edges,
      metadata: {
        created_at: new Date().toISOString(),
        version: '1.0',
        statistics: {
          nodeCount: nodes.length,
          topicCount: nodes.filter(n => n.data.type === 'topic').length,
          paragraphCount: nodes.filter(n => n.data.type === 'paragraph').length
        }
      }
    };
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {mindMapData.title || '思维导图'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
          </div>
        </div>

        {/* 思维导图区域 */}
        <div className="flex-1">
          {editMode ? (
            <MindElixirViewer
              data={convertToMindElixirFormat(mindMapData)}
              onClose={handleGoBack}
              onSave={(updatedData) => {
                handleSaveMindMap(convertToReactFlowFormat(updatedData));
                setEditMode(false); // 保存后退出编辑模式
              }}
              onViewMode={() => setEditMode(false)} // 点击查看模式按钮退出编辑模式
            />
          ) : (
            <MindMapViewer
              data={mindMapData}
              onClose={handleGoBack}
              onEdit={() => setEditMode(true)} // 点击编辑按钮进入编辑模式
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}