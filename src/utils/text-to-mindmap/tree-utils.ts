/* eslint-disable no-control-regex */

export interface MindElixirNode {
  id: string;
  topic: string;
  children?: MindElixirNode[];
}

export interface MindElixirData {
  nodeData: MindElixirNode;
}

/* ───────────── 先做一个总入口 ────────────── */

export function parseTree(raw: string): MindElixirData {
  console.log('🚀 使用增强版树结构解析器');
  const text = raw.replace(/\r\n/g, "\n");               // 统一行尾
  const fmt = detectFormat(text);
  console.log(`📊 检测到格式: ${fmt}`);

  let nodes: MindElixirNode[];
  switch (fmt) {
    case "json":     nodes = fromJSON(text); break;
    case "yaml":     nodes = fromYAML(text); break;
    case "xml":      nodes = fromXML(text); break;
    case "heading":  nodes = fromHeadings(text); break;
    case "list":     nodes = fromMarkdownList(text); break;
    case "org":      nodes = fromOrg(text); break;
    case "path":     nodes = fromPath(text); break;
    case "indent":   nodes = fromIndent(text); break;
    case "smart_outline": nodes = fromSmartOutline(text); break;
    default: throw new Error("无法识别树形格式，或格式不受支持");
  }

  // 如果只有一个根节点，直接返回
  if (nodes.length === 1) {
    return { nodeData: nodes[0] };
  }

  // 如果有多个根节点，创建一个总根节点
  const rootTopic = nodes.length > 0 ? nodes[0].topic : '思维导图';
  return {
    nodeData: {
      id: 'root',
      topic: rootTopic,
      children: nodes.length > 1 ? nodes : nodes[0]?.children || []
    }
  };
}

/* ───────────── 判断是否为树 ────────────── */

export function isTreeStructure(raw: string): boolean {
  try {
    detectFormat(raw, true);      // 第二个参数 = true → 仅返回是否能判定
    return true;
  } catch {
    return false;
  }
}

/* ───────────── 格式探测器 ────────────── */

function detectFormat(text: string, onlyValidate = false):
  "json"|"yaml"|"xml"|"heading"|"list"|"org"|"path"|"indent"|"smart_outline" {
  const trimmed = text.trim();
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  // 优先检测结构化格式
  if (/^[\[{]/.test(trimmed))              return "json";
  if (/^</.test(trimmed))                  return "xml";
  
  // 检测智能大纲格式（章节 + 编号小节）
  const chapterCount = lines.filter(line => /^第[一二三四五六七八九十\d]+章\s*.+/.test(line)).length;
  const sectionCount = lines.filter(line => /^\d+\.\d+(?:\.\d+)?\s+.+/.test(line)).length;
  if (chapterCount > 0 && sectionCount > 0) return "smart_outline";
  
  // 检测 Markdown 格式
  if (/^#{1,6}\s+/m.test(text))            return "heading";
  if (/^[-*+]\s|^\d+[\.)]\s/m.test(text))  return "list";
  
  // 检测其他格式
  if (/^\*+\s/m.test(text))                return "org";
  if (/^[^\n\/]+\/.+/m.test(text))         return "path";
  
  // 检测 YAML（需要更严格的判断）
  if (/:\s+\S+/m.test(text) && /[\n\s]/.test(text)) {
    try { 
      // 简单的 YAML 检测，避免引入 js-yaml 依赖
      if (text.includes(':\n') || text.includes(': ')) {
        return "yaml"; 
      }
    } catch { /* ignore */ }
  }
  
  // 至少两行、至少一行有缩进
  if (text.split("\n").length > 1 &&
      /^\s+\S+/m.test(text))              return "indent";

  if (onlyValidate) throw new Error("Not a tree");
  // 默认当成缩进
  return "indent";
}

/* ───────────── 各格式解析 ────────────── */

function fromJSON(text: string): MindElixirNode[] {
  const obj = JSON.parse(text);
  return convertUnknownTree(obj);
}

function fromYAML(text: string): MindElixirNode[] {
  // 简化的 YAML 解析，避免外部依赖
  const lines = text.split('\n');
  return buildByIndent(lines.map(line => {
    // 移除 YAML 的冒号语法，转换为纯缩进
    return line.replace(/:\s*$/, '').replace(/:\s+(.+)/, ' $1');
  }));
}

function fromXML(text: string): MindElixirNode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  return [walkXML(doc.documentElement)];
}

function fromHeadings(text: string): MindElixirNode[] {
  type Temp = { level: number; node: MindElixirNode };
  const stack: Temp[] = [];
  const roots: MindElixirNode[] = [];

  text.split("\n").forEach(line => {
    const m = line.match(/^(#{1,6})\s+(.*)/);
    if (!m) return;
    const level = m[1].length;
    const node: MindElixirNode = { id: generateId(), topic: m[2] };

    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    if (stack.length) {
      pushChild(stack[stack.length - 1].node, node);
    } else {
      roots.push(node);
    }
    stack.push({ level, node });
  });
  return roots;
}

function fromOrg(text: string): MindElixirNode[] {
  type Temp = { level: number; node: MindElixirNode };
  const stack: Temp[] = [];
  const roots: MindElixirNode[] = [];

  text.split("\n").forEach(line => {
    const m = line.match(/^(\*+)\s+(.*)/);
    if (!m) return;
    const level = m[1].length;
    const node: MindElixirNode = { id: generateId(), topic: m[2] };

    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    if (stack.length) pushChild(stack[stack.length - 1].node, node);
    else roots.push(node);
    stack.push({ level, node });
  });
  return roots;
}

function fromMarkdownList(text: string): MindElixirNode[] {
  const lines = text.split("\n").filter(Boolean);
  return buildByIndent(
    lines.map(l => l.replace(/^(\s*([-*+]|\d+[\.)])\s+)/, "$1#").replace(/^\s*[-*+]|\d+[\.)]\s+/, ""))
  );
}

function fromIndent(text: string): MindElixirNode[] {
  const lines = text.split("\n");
  return buildByIndent(lines);
}

function fromPath(text: string): MindElixirNode[] {
  const tree: Record<string, MindElixirNode> = {};
  const roots: MindElixirNode[] = [];

  text.split("\n").filter(Boolean).forEach(p => {
    const parts = p.split(/\s*\/\s*/);
    parts.reduce((parentPath, cur) => {
      const curPath = parentPath ? parentPath + "/" + cur : cur;
      if (!tree[curPath]) {
        tree[curPath] = { id: generateId(), topic: cur };
        if (parentPath) pushChild(tree[parentPath], tree[curPath]);
        else roots.push(tree[curPath]);
      }
      return curPath;
    }, "");
  });
  return roots;
}

function fromSmartOutline(text: string): MindElixirNode[] {
  // 使用现有的智能大纲解析器
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length === 0) {
    return [{ id: 'root', topic: '空白思维导图', children: [] }];
  }

  const rootNode: MindElixirNode = {
    topic: lines[0],
    id: 'root',
    children: []
  };

  let nodeIdCounter = 1;
  
  // 中文数字转换
  const chineseToNumber = (chinese: string) => {
    const map: Record<string, number> = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
    };
    return map[chinese] || parseInt(chinese) || 0;
  };

  // 查找章节节点（包括根节点）
  const findChapterByNumber = (chapterNum: number): MindElixirNode | null => {
    // 首先检查根节点是否是对应的章节
    const rootMatch = rootNode.topic.match(/^第([一二三四五六七八九十\d]+)章/);
    if (rootMatch) {
      const rootNum = chineseToNumber(rootMatch[1]);
      if (rootNum === chapterNum) {
        return rootNode;
      }
    }
    
    // 然后检查子节点
    for (const child of rootNode.children) {
      const match = child.topic.match(/^第([一二三四五六七八九十\d]+)章/);
      if (match) {
        const num = chineseToNumber(match[1]);
        if (num === chapterNum) {
          return child;
        }
      }
    }
    return null;
  };

  // 解析每一行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // 检测章节标题
    const chapterMatch = line.match(/^第[一二三四五六七八九十\d]+章\s*(.+)/);
    if (chapterMatch) {
      const chapterNode: MindElixirNode = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };
      rootNode.children.push(chapterNode);
      continue;
    }

    // 检测编号小节
    const sectionMatch = line.match(/^(\d+)\.(\d+)(?:\.(\d+))?\s+(.+)/);
    if (sectionMatch) {
      const chapterNum = parseInt(sectionMatch[1]);
      
      const sectionNode: MindElixirNode = {
        topic: line,
        id: `node-${nodeIdCounter++}`,
        children: []
      };

      // 查找对应的章节
      const targetChapter = findChapterByNumber(chapterNum);
      if (targetChapter) {
        if (!targetChapter.children) {
          targetChapter.children = [];
        }
        targetChapter.children.push(sectionNode);
      } else {
        rootNode.children.push(sectionNode);
      }
      continue;
    }

    // 检测列表项
    const listMatch = line.match(/^[-•*+]\s+(.+)/);
    if (listMatch) {
      const listNode: MindElixirNode = {
        topic: listMatch[1],
        id: `node-${nodeIdCounter++}`,
        children: []
      };

      // 添加到最近的小节（递归查找）
      let added = false;

      // 递归查找最近的小节
      const findLatestSection = (node: MindElixirNode): MindElixirNode | null => {
        // 从后往前查找子节点
        if (node.children) {
          for (let j = node.children.length - 1; j >= 0; j--) {
            const child = node.children[j];

            // 如果是小节，返回它
            if (/^\d+\.\d+/.test(child.topic)) {
              return child;
            }

            // 递归查找子节点中的小节
            const found = findLatestSection(child);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };

      const latestSection = findLatestSection(rootNode);
      if (latestSection) {
        if (!latestSection.children) {
          latestSection.children = [];
        }
        latestSection.children.push(listNode);
        added = true;
      }

      // 如果没有找到小节，添加到根节点
      if (!added) {
        rootNode.children.push(listNode);
      }
      continue;
    }

    // 普通段落 - 跳过
  }

  return [rootNode];
}

/* ───────────── 通用辅助 ────────────── */

function buildByIndent(lines: string[]): MindElixirNode[] {
  type Temp = { indent: number; node: MindElixirNode };
  const stack: Temp[] = [];
  const roots: MindElixirNode[] = [];

  lines.forEach(raw => {
    if (!raw.trim()) return;
    const indent = raw.match(/^\s*/)?.[0].length ?? 0;
    const node: MindElixirNode = { id: generateId(), topic: raw.trim() };

    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    if (stack.length) pushChild(stack[stack.length - 1].node, node);
    else roots.push(node);
    stack.push({ indent, node });
  });
  return roots;
}

function walkXML(el: Element): MindElixirNode {
  const node: MindElixirNode = { id: generateId(), topic: el.tagName };
  el.childNodes.forEach(child => {
    if (child.nodeType === 1) {      // 元素
      pushChild(node, walkXML(child as Element));
    }
  });
  return node;
}

function pushChild(parent: MindElixirNode, child: MindElixirNode) {
  (parent.children ??= []).push(child);
}

function convertUnknownTree(obj: any): MindElixirNode[] {
  if (Array.isArray(obj)) {
    return obj.map(o => convertUnknownTree(o)[0]);  // 数组 → 同级
  }
  if (typeof obj === "object" && obj != null) {
    const node: MindElixirNode = { id: generateId(), topic: String(obj.name ?? obj.topic ?? "root") };
    Object.entries(obj).forEach(([k, v]) => {
      if (k === "name" || k === "topic" || k === "id") return;
      if (Array.isArray(v)) v.forEach(inner => pushChild(node, convertUnknownTree(inner)[0]));
      else if (typeof v === "object") pushChild(node, convertUnknownTree(v)[0]);
      else pushChild(node, { id: generateId(), topic: String(v) });
    });
    return [node];
  }
  return [{ id: generateId(), topic: String(obj) }];
}

function generateId(): string {
  return 'node-' + Math.random().toString(36).substr(2, 9);
}
