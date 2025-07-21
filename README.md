# 🧠 思维导图生成器

一个轻量级的思维导图生成工具，可以将用户输入的任意形式文本快速转换为结构化的可视化思维导图。

## ✨ 项目特性

### 🎯 核心功能
- **智能文本解析**：支持任意形式的文本输入，自动识别层级结构
- **多格式文档支持**：支持 TXT、DOCX 文件上传和文本直接输入
- **快速处理**：轻量级文本处理，无需复杂的AI模型调用
- **即时预览**：实时生成并展示思维导图
- **交互式操作**：可缩放、拖拽、导出的思维导图界面

### 🚀 技术亮点
- **智能格式识别**：自动检测单行、多行、层级、编号等文本格式
- **灵活兼容性**：处理任意形式的文本输入，无需特定格式要求
- **高效性能**：纯前端文本解析，处理速度快
- **现代化UI**：响应式设计，完美适配桌面和移动设备
- **开箱即用**：无需AI服务配置，部署简单

## 🏗️ 技术架构

### 前端技术栈
- **框架**：Next.js 15.3 (App Router)
- **UI库**：React 18 + TypeScript
- **样式**：Tailwind CSS + Shadcn UI + Radix Primitives  
- **图标**：Lucide React
- **思维导图引擎**：Mind-Elixir 5.0.1
- **通知**：Sonner

### 后端技术栈
- **运行时**：Node.js + Next.js API Routes
- **文档解析**：pdf-parse + mammoth (docx)
- **文本处理**：纯JavaScript文本解析算法
- **数据库**：Supabase (可选，用于用户管理)

### 开发工具
- **包管理**：Bun
- **代码质量**：Biome (格式化 + Linting)
- **类型检查**：TypeScript 5.8
- **部署**：Netlify

## 📁 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── api/mindmap/generate/     # 思维导图生成API
│   ├── page.tsx                  # 主页面
│   ├── layout.tsx                # 全局布局
│   └── globals.css               # 全局样式（包含Mind-Elixir样式）
├── components/
│   ├── ui/                       # UI组件库
│   └── mindmap/
│       └── MindElixirViewer.tsx  # Mind-Elixir组件封装
├── utils/
│   ├── text-to-mindmap/          # 文本结构化处理核心
│   │   └── index.ts              # 文本解析和转换逻辑
│   └── document-parser/          # 文档解析器
│       └── index.ts              # 文件解析工具
└── lib/
    ├── config/                   # 应用配置
    ├── types/                    # TypeScript类型定义
    └── supabase/                 # 数据库集成（可选）
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm/yarn/bun (任选其一)

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用其他包管理器
# yarn install
# bun install
```

### 环境配置

项目开箱即用，无需额外配置。

如需数据库功能（可选），创建 `.env.local` 文件：

```env
# Supabase 配置 (可选)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 使用指南

### 🎯 核心流程对比

#### 期望的项目流程
```
用户输入文本 → 结构化处理 → JSON格式 → Mind-Elixir思维导图
```

#### 当前实现的流程
```
用户输入文本 → smartTextParse()解析 → MindElixirData格式 → Mind-Elixir渲染
```

**✅ 完全符合期望！**

### 1. 文本输入方式

#### 1.1 直接文本输入
- 支持任意形式的文本内容
- 长度限制：50,000字符以内
- 自动识别文本结构

#### 1.2 文件上传
- 支持格式：`.txt`, `.docx`
- 文件大小限制：9MB
- 自动提取文本内容

### 2. 支持的文本格式

#### 单行文本
```
我的思维导图
```
→ 生成根节点为"我的思维导图"的简单结构

#### 列表格式
```
我的思维导图
- 第一个分支
- 第二个分支
- 第三个分支
```

#### 层级格式
```
项目规划
  - 需求分析
    - 用户调研
    - 竞品分析
  - 设计阶段
    - UI设计
    - 交互设计
```

#### 数字编号
```
学习计划
1. 基础知识
2. 实践项目
3. 总结提升
```

### 3. 文本处理流程
1. **智能格式检测**：自动识别文本的层级结构
2. **结构化解析**：将文本转换为树形结构
3. **JSON格式化**：生成Mind-Elixir所需的数据格式
4. **思维导图渲染**：使用Mind-Elixir库展示

### 4. 结果展示
- 基于Mind-Elixir的交互式思维导图
- 支持缩放、拖拽、编辑
- 多层级节点结构
- 导出功能 (JSON格式)

## 🔧 API文档

### POST `/api/mindmap/generate`

将文本转换为思维导图的核心API。

#### 请求参数 (FormData)

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | 输入类型：`file_upload` 或 `text_input` |
| `title` | string | ✅ | 文档标题 |
| `file` | File | 条件 | 上传的文件 (当type为file_upload时) |
| `content` | string | 条件 | 文本内容 (当type为text_input时) |

#### 响应格式

```typescript
interface ApiResponse<MindElixirData> {
  success: boolean;
  data?: {
    nodeData: {
      topic: string;
      id: string;
      children?: MindElixirNode[];
    };
    linkData?: unknown[];
  };
  error?: {
    message: string;
    code: string;
  };
  metadata?: {
    timestamp: string;
    processingTime: number;
  };
}
```

#### 示例请求

```javascript
const formData = new FormData();
formData.append('type', 'text_input');
formData.append('title', '我的思维导图');
formData.append('content', '我的思维导图\n- 第一个分支\n- 第二个分支');

const response = await fetch('/api/mindmap/generate', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.data); // Mind-Elixir格式的数据
```

## ⚙️ 配置说明

### 应用配置 (`src/lib/config/app.ts`)

```typescript
export const textConfig = {
  maxLength: 50000,                   // 文本长度限制
  placeholder: "输入您想要转换的文本内容..."
};

export const fileTypeConfig = {
  maxSize: 9 * 1024 * 1024,          // 文件大小限制 (9MB)
  acceptedMimeTypes: [                // 支持的文件类型
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};
```

## 🧪 代码质量

### 代码规范
```bash
# 代码格式化和检查
npm run lint

# 构建检查
npm run build
```

### 技术原则
- **轻量高效**：无需AI服务，处理速度快
- **类型安全**：全面的 TypeScript 类型定义
- **兼容性强**：支持任意形式的文本输入
- **用户友好**：简洁的界面和清晰的操作流程

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📝 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 👨‍💻 作者

- 开发者：[你的名字]
- 邮箱：[你的邮箱]
- GitHub：[你的GitHub]

## 🙏 致谢

感谢以下开源项目的支持：
- [Next.js](https://nextjs.org) - React全栈框架
- [Mind-Elixir](https://github.com/ssshooter/mind-elixir-core) - 思维导图渲染引擎
- [Tailwind CSS](https://tailwindcss.com) - CSS框架
- [Shadcn UI](https://ui.shadcn.com) - UI组件库

---

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**
