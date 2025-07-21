import { kmeans } from 'ml-kmeans';
import type { EmbeddingResult, ClusterGroup, TopicSummary } from '@/lib/types';
import { clusteringConfig } from '@/lib/config/app';

/**
 * 计算向量之间的余弦相似度
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 计算最优聚类数量
 */
function calculateOptimalClusterCount(embeddings: EmbeddingResult[]): number {
  const numParagraphs = embeddings.length;

  // 对于少量段落，使用较少的聚类
  if (numParagraphs <= 5) {
    return Math.max(2, Math.ceil(numParagraphs / 2));
  }

  if (numParagraphs <= 10) {
    return Math.min(4, Math.ceil(numParagraphs / 3));
  }

  // 对于较多段落，使用平方根规则，但限制在配置范围内
  const sqrtRule = Math.ceil(Math.sqrt(numParagraphs));
  return Math.max(
    clusteringConfig.minClusters,
    Math.min(clusteringConfig.maxClusters, sqrtRule)
  );
}

/**
 * 计算聚类质量评估指标（轮廓系数）
 */
function calculateSilhouetteScore(
  embeddings: EmbeddingResult[],
  clusters: number[]
): number {
  const n = embeddings.length;
  if (n <= 1) return 0;

  let totalScore = 0;

  for (let i = 0; i < n; i++) {
    const currentCluster = clusters[i];
    const currentVector = embeddings[i].vector;

    // 计算簇内距离（a）
    let intraClusterDistance = 0;
    const intraClusterCount = 0;

    // 计算最近邻簇距离（b）
    let nearestClusterDistance = Number.POSITIVE_INFINITY;

    // 按簇分组计算距离
    const clusterDistances: { [key: number]: number[] } = {};

    for (let j = 0; j < n; j++) {
      if (i === j) continue;

      const distance = 1 - cosineSimilarity(currentVector, embeddings[j].vector);
      const otherCluster = clusters[j];

      if (!clusterDistances[otherCluster]) {
        clusterDistances[otherCluster] = [];
      }
      clusterDistances[otherCluster].push(distance);
    }

    // 计算簇内平均距离
    if (clusterDistances[currentCluster] && clusterDistances[currentCluster].length > 0) {
      intraClusterDistance = clusterDistances[currentCluster].reduce((a, b) => a + b, 0) /
                           clusterDistances[currentCluster].length;
    }

    // 计算最近邻簇平均距离
    for (const clusterId in clusterDistances) {
      const id = Number.parseInt(clusterId);
      if (id !== currentCluster && clusterDistances[id].length > 0) {
        const avgDistance = clusterDistances[id].reduce((a, b) => a + b, 0) /
                           clusterDistances[id].length;
        nearestClusterDistance = Math.min(nearestClusterDistance, avgDistance);
      }
    }

    // 计算轮廓系数
    if (nearestClusterDistance === Number.POSITIVE_INFINITY) {
      nearestClusterDistance = 0;
    }

    const silhouette = nearestClusterDistance === 0 && intraClusterDistance === 0 ?
                      0 :
                      (nearestClusterDistance - intraClusterDistance) /
                      Math.max(nearestClusterDistance, intraClusterDistance);

    totalScore += silhouette;
  }

  return totalScore / n;
}

/**
 * 执行K-means聚类
 */
export async function performKMeansClustering(
  embeddings: EmbeddingResult[]
): Promise<ClusterGroup[]> {
  if (embeddings.length === 0) {
    throw new Error('没有提供嵌入向量数据');
  }

  if (embeddings.length === 1) {
    return [{
      clusterId: 0,
      paragraphs: [embeddings[0].text],
      centerEmbedding: embeddings[0].vector,
      paragraphIndices: [embeddings[0].paragraphIndex],
      size: 1
    }];
  }

  // 准备向量数据
  const vectors = embeddings.map(emb => emb.vector);

  // 计算最优聚类数量
  const optimalK = calculateOptimalClusterCount(embeddings);

  try {
    // 执行K-means聚类
    const result = kmeans(vectors, optimalK, {
      initialization: 'kmeans++',
      maxIterations: 100,
      tolerance: 1e-4
    });

    // 评估聚类质量
    const silhouetteScore = calculateSilhouetteScore(embeddings, result.clusters);

    console.log(`聚类完成: ${optimalK} 个聚类, 轮廓系数: ${silhouetteScore.toFixed(3)}`);

    // 如果聚类质量太差，尝试减少聚类数量
    if (silhouetteScore < 0.1 && optimalK > 2) {
      console.log('聚类质量较差，尝试减少聚类数量...');
      const fallbackK = Math.max(2, optimalK - 1);
      const fallbackResult = kmeans(vectors, fallbackK, {
        initialization: 'kmeans++',
        maxIterations: 100,
        tolerance: 1e-4
      });

      const fallbackScore = calculateSilhouetteScore(embeddings, fallbackResult.clusters);

      if (fallbackScore > silhouetteScore) {
        console.log(`使用备选聚类方案: ${fallbackK} 个聚类, 轮廓系数: ${fallbackScore.toFixed(3)}`);
        return buildClusterGroups(embeddings, fallbackResult.clusters, fallbackResult.centroids);
      }
    }

    return buildClusterGroups(embeddings, result.clusters, result.centroids);
  } catch (error) {
    console.error('K-means聚类失败:', error);

    // 降级方案：按文本长度分组
    console.log('使用降级聚类方案...');
    return performFallbackClustering(embeddings);
  }
}

/**
 * 构建聚类分组结果
 */
function buildClusterGroups(
  embeddings: EmbeddingResult[],
  clusterAssignments: number[],
  centroids: number[][]
): ClusterGroup[] {
  const clusterMap = new Map<number, {
    paragraphs: string[];
    paragraphIndices: number[];
    centerEmbedding: number[];
  }>();

  // 初始化聚类映射
  for (let i = 0; i < centroids.length; i++) {
    clusterMap.set(i, {
      paragraphs: [],
      paragraphIndices: [],
      centerEmbedding: centroids[i]
    });
  }

  // 分配段落到聚类
  for (let i = 0; i < embeddings.length; i++) {
    const clusterId = clusterAssignments[i];
    const embedding = embeddings[i];

    const cluster = clusterMap.get(clusterId);
    if (cluster) {
      cluster.paragraphs.push(embedding.text);
      cluster.paragraphIndices.push(embedding.paragraphIndex);
    }
  }

  // 构建结果数组
  const results: ClusterGroup[] = [];

  for (const [clusterId, cluster] of clusterMap.entries()) {
    if (cluster.paragraphs.length > 0) {
      results.push({
        clusterId,
        paragraphs: cluster.paragraphs,
        centerEmbedding: cluster.centerEmbedding,
        paragraphIndices: cluster.paragraphIndices,
        size: cluster.paragraphs.length
      });
    }
  }

  // 按聚类大小排序（大的聚类在前）
  results.sort((a, b) => b.size - a.size);

  // 重新分配聚类ID
  return results.map((cluster, index) => ({
    ...cluster,
    clusterId: index
  }));
}

/**
 * 降级聚类方案（当K-means失败时使用）
 */
function performFallbackClustering(embeddings: EmbeddingResult[]): ClusterGroup[] {
  console.log('执行降级聚类方案...');

  // 按文本长度分组
  const shortTexts: EmbeddingResult[] = [];
  const mediumTexts: EmbeddingResult[] = [];
  const longTexts: EmbeddingResult[] = [];

  for (const embedding of embeddings) {
    const textLength = embedding.text.length;
    if (textLength < 100) {
      shortTexts.push(embedding);
    } else if (textLength < 300) {
      mediumTexts.push(embedding);
    } else {
      longTexts.push(embedding);
    }
  }

  const groups: ClusterGroup[] = [];
  let clusterId = 0;

  // 创建聚类组
  const addGroup = (texts: EmbeddingResult[], name: string) => {
    if (texts.length > 0) {
      // 计算平均向量作为中心
      const centerEmbedding = new Array(texts[0].vector.length).fill(0);
      for (const text of texts) {
        for (let i = 0; i < text.vector.length; i++) {
          centerEmbedding[i] += text.vector[i];
        }
      }
      for (let i = 0; i < centerEmbedding.length; i++) {
        centerEmbedding[i] /= texts.length;
      }

      groups.push({
        clusterId: clusterId++,
        paragraphs: texts.map(t => t.text),
        centerEmbedding,
        paragraphIndices: texts.map(t => t.paragraphIndex),
        size: texts.length
      });
    }
  };

  addGroup(longTexts, 'long');
  addGroup(mediumTexts, 'medium');
  addGroup(shortTexts, 'short');

  // 如果只有一个组，尝试进一步细分
  if (groups.length === 1 && groups[0].size > 4) {
    const group = groups[0];
    const midPoint = Math.floor(group.size / 2);

    const firstHalf = embeddings.slice(0, midPoint);
    const secondHalf = embeddings.slice(midPoint);

    return [
      {
        clusterId: 0,
        paragraphs: firstHalf.map(e => e.text),
        centerEmbedding: group.centerEmbedding,
        paragraphIndices: firstHalf.map(e => e.paragraphIndex),
        size: firstHalf.length
      },
      {
        clusterId: 1,
        paragraphs: secondHalf.map(e => e.text),
        centerEmbedding: group.centerEmbedding,
        paragraphIndices: secondHalf.map(e => e.paragraphIndex),
        size: secondHalf.length
      }
    ];
  }

  return groups;
}

/**
 * 优化聚类结果（合并过小的聚类到最相似的聚类中）
 */
export function optimizeClusterGroups(groups: ClusterGroup[]): ClusterGroup[] {
  const minClusterSize = 1; // 最小聚类大小
  const optimizedGroups = [...groups];

  // 找出太小的聚类
  const smallClusters = optimizedGroups.filter(group => group.size < minClusterSize);
  const largeClusters = optimizedGroups.filter(group => group.size >= minClusterSize);

  // 将小聚类合并到最相似的大聚类中
  for (const smallCluster of smallClusters) {
    let bestSimilarity = -1;
    let bestTargetIndex = 0;

    // 找到最相似的大聚类
    for (let i = 0; i < largeClusters.length; i++) {
      const similarity = cosineSimilarity(
        smallCluster.centerEmbedding,
        largeClusters[i].centerEmbedding
      );

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestTargetIndex = i;
      }
    }

    // 合并到最相似的聚类
    if (largeClusters.length > 0) {
      const targetCluster = largeClusters[bestTargetIndex];
      targetCluster.paragraphs.push(...smallCluster.paragraphs);
      targetCluster.paragraphIndices.push(...smallCluster.paragraphIndices);
      targetCluster.size += smallCluster.size;
    }
  }

  return largeClusters.map((group, index) => ({
    ...group,
    clusterId: index
  }));
}
