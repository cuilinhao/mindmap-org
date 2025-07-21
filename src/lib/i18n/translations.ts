// 翻译文件
export const translations = {
  en: {
    // 导航
    nav: {
      home: 'Home',
      features: 'Features',
      faq: 'FAQ',
      contact: 'Contact Us',
      login: 'Login',
      register: 'Sign Up Free'
    },
    // 首页
    hero: {
      badge: 'AI-Powered Mind Map Generator',
      title: 'Transform Your Documents',
      titleHighlight: 'Into Clear Mind Maps',
      description: 'Upload documents or input text, let AI automatically analyze content and generate structured mind maps to help you better understand and memorize information.',
      startButton: 'Get Started',
      usersCount: 'Trusted by over 10,000+ users',
      mindMapLabel: 'Mind Map'
    },
    // 联系我们部分
    contact: {
      title: 'Questions or Suggestions?',
      subtitle: 'We would love to hear your feedback, please fill out the form below to contact us',
      info: {
        title: 'Contact Information',
        description: 'Fill out the form and our team will get back to you within 24 hours.',
        email: 'Email',
        emailAddress: '15021538370@163.com',
        workingHours: 'Working Hours',
        workingTime: 'Monday to Friday 9:00 - 18:00',
        twitter: 'X (Twitter)',
        twitterHandle: '@yihaoquan17888'
      },
      form: {
        name: 'Name',
        namePlaceholder: 'Your name',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        company: 'Company/Organization (Optional)',
        companyPlaceholder: 'Your company or organization name',
        message: 'Message',
        messagePlaceholder: 'Please describe your requirements or questions in detail...',
        sending: 'Submitting...',
        send: 'Send Message',
        thankYou: 'Thank you for your message',
        confirmation: 'We have received your message and will contact you soon.'
      },
      partners: 'Trusted Partners'
    },
    // 功能部分
    features: {
      title: 'Powerful Features, Easy to Use',
      subtitle: 'MindFlow provides comprehensive mind map generation and management features to meet your various needs',
      items: [
        {
          title: 'Multiple Format Support',
          description: 'Support TXT, PDF, DOCX, PPTX, Markdown and other document formats, easily import your content.'
        },
        {
          title: 'AI Intelligent Analysis',
          description: 'Advanced AI technology automatically analyzes document structure and content, extracting key information and logical relationships.'
        },
        {
          title: 'Fast Generation',
          description: 'Generate mind maps in seconds, no need for manual drawing, saving time and effort.'
        },
        {
          title: 'Multiple Export Options',
          description: 'Support export as image, JSON or Markdown format, convenient for sharing and further editing.'
        },
        {
          title: 'Custom Editing',
          description: 'After generation, freely adjust the structure and style of the mind map to meet personalized needs.'
        },
        {
          title: 'Easy Sharing',
          description: 'Share mind map links with one click, easily collaborate with team members or friends.'
        },
        {
          title: 'Data Security',
          description: 'Strict data protection measures ensure your document content is safe and reliable.'
        },
        {
          title: 'Responsive Design',
          description: 'Perfect adaptation to desktop and mobile devices, access your mind maps anytime, anywhere.'
        },
        {
          title: 'Cloud Storage',
          description: 'Automatically saved to the cloud, no need to worry about data loss, view history at any time.'
        }
      ],
      highlight: {
        title: 'AI-Driven Mind Map Generation',
        description: 'MindFlow uses advanced artificial intelligence technology to automatically analyze document content, extract key information and logical relationships, and generate clearly structured mind maps.',
        features: [
          'Intelligent recognition of document structure and hierarchical relationships',
          'Automatic extraction of key concepts and themes',
          'Generate logically clear mind map structures',
          'Support multi-language document analysis'
        ]
      }
    },
    // FAQ部分
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Common questions about MindFlow mind map generator',
      items: [
        {
          question: 'What is a mind map?',
          answer: 'A mind map is a graphical thinking tool that connects a central topic with related concepts through a branching structure, helping users organize information, clarify thoughts, enhance memory, and promote creative thinking.'
        },
        {
          question: 'Which file formats does MindFlow support?',
          answer: 'Currently, MindFlow supports TXT, PDF, DOCX, PPTX, and Markdown (.md) file formats. We continuously add support for more formats based on user needs.'
        },
        {
          question: 'How can I export the generated mind map?',
          answer: 'You can export the mind map as a PNG image, JSON format, or Markdown document. Click the corresponding export button in the top toolbar on the mind map page.'
        },
        {
          question: 'What is the principle behind mind map generation?',
          answer: 'MindFlow uses advanced natural language processing technology to analyze document content, identify topics, key points, and hierarchical relationships, and then transform this information into a structured mind map.'
        },
        {
          question: 'Can I edit the generated mind map?',
          answer: 'Yes, the generated mind map supports basic editing functions. You can add or delete nodes, adjust the structure, and customize the style.'
        },
        {
          question: 'Is there a file size limit?',
          answer: 'To ensure service quality, the current file size limit is 10MB. If you need to process larger files, please contact our customer support.'
        },
        {
          question: 'How accurate is the AI-generated mind map?',
          answer: 'The accuracy depends on the structure and clarity of your input document. For well-structured documents, the accuracy is typically over 90%. For less structured content, the AI will do its best to identify key concepts and relationships, but may require some manual adjustments.'
        },
        {
          question: 'Can I collaborate with others on mind maps?',
          answer: 'Yes, you can share your mind maps with team members or colleagues. In the premium version, you can enable real-time collaboration features that allow multiple users to edit the same mind map simultaneously.'
        },
        {
          question: 'Is my data secure when using MindFlow?',
          answer: 'We take data security very seriously. All uploaded documents and generated mind maps are encrypted both in transit and at rest. We do not share your data with third parties, and you can delete your data at any time.'
        }
      ]
    },
    // 主要内容
    main: {
      title: 'Start Creating Your Mind Map',
      description: 'Choose input method: directly input text or upload document files',
      textTab: 'Text Input',
      fileTab: 'File Upload',
      textPlaceholder: 'Enter or paste your text content to analyze (minimum 50 characters)...\n\nFor best results, use hierarchical structure like:\n• Headings with subheadings\n• Numbered or bulleted lists\n• Indented paragraphs\n• Markdown format (# Heading, ## Subheading, **bold**, *italic*, ```code```)\n\nSupports multiple languages including English, Chinese, Japanese, etc.',
      charCount: 'characters',
      langSupport: 'Supports multiple languages including English, Chinese, etc.',
      testButton: 'Click to Test',
      generateButton: 'Generate Mind Map',
      processingButton: 'Processing...',
      fileDropText: 'Choose a file or drag & drop',
      fileDropActive: 'Drop to upload',
      fileSelected: 'Selected: ',
      fileSupport: 'Supports TXT, PDF, DOCX, PPTX, Markdown formats, max 10MB',
      markdownSample: 'Try our Markdown sample',
      fileDragDetected: '💡 File drag detected, switched to file upload mode',
      selectFileAgain: 'Select Another File',
      uploadButton: 'Upload & Generate',
      // 状态消息
      preparing: 'Preparing...',
      uploading: 'Uploading...',
      processing: 'Processing...',
      parsing: 'Parsing text...',
      readingFile: 'Reading file content...',
      generating: 'Generating mind map...',
      completed: 'Mind map generation completed!',
      // 错误消息
      errorNoText: 'Please enter at least 50 characters of text content',
      errorTextTooLong: 'Text content cannot exceed {maxLength} characters',
      errorNoFile: 'Please select a file',
      errorUnsupportedFile: 'Unsupported file type. Please upload TXT, PDF, DOCX, PPTX or Markdown (.md) file.',
      errorFileTooLarge: 'File size cannot exceed {maxSize} MB',
      errorParseFailed: 'File parsing failed',
      errorGeneral: 'Processing failed, please try again',
      errorDocNotSupported: 'DOC file format is not supported. DOC is an older binary format. Suggestions:\n1. Convert the file to DOCX format and try again\n2. Copy the file content to the text input box\n3. Use other supported formats (TXT, PDF, DOCX)',
      // 结果
      resultTitle: 'Generated Mind Map',
      resultDescription: 'You can view and export this mind map "Right-click to edit nodes"',
      resetButton: 'Start Over'
    },
    // 思维导图查看器
    mindmap: {
      title: 'Mind Map',
      defaultTitle: 'Mind Map',
      loading: 'Initializing mind map...',
      error: 'Initialization failed',
      backToHome: 'Back to Home',
      export: {
        json: 'Export as JSON',
        markdown: 'Export as Markdown',
        image: 'Export as Image',
        filename: 'mind-map'
      },
      edit: {
        save: 'Save Changes',
        viewMode: 'Switch to View Mode',
        title: 'Edit Mode Tips:',
        tips: {
          doubleClick: 'Double-click a node to edit text',
          rightClick: 'Right-click a node to add child/sibling nodes or delete',
          drag: 'Drag nodes to adjust position',
          save: 'Click save button when finished'
        }
      },
      controls: {
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        reset: 'Reset View',
        back: 'Back'
      },
      contextMenu: {
        addChild: 'Insert Child Node',
        addSibling: 'Insert Sibling',
        focus: 'Focus',
        unfocus: 'Unfocus',
        summary: 'Summary',
        link: 'Link',
        bidirectionalLink: 'Bidirectional Link',
        delete: 'Delete',
        edit: 'Edit',
        style: 'Style',
        copy: 'Copy',
        paste: 'Paste'
      }
    },
    // 页脚
    footer: {
      description: 'MindFlow is an intelligent mind map generation tool that helps you transform documents and ideas into structured mind maps.',
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      tutorials: 'Tutorials',
      changelog: 'Changelog',
      support: 'Support',
      helpCenter: 'Help Center',
      faq: 'FAQ',
      contact: 'Contact Us',
      apiDocs: 'API Docs',
      company: 'Company',
      about: 'About Us',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      careers: 'Careers',
      copyright: '© {year} MindFlow. All rights reserved.'
    }
  },
  zh: {
    // 导航
    nav: {
      home: '首页',
      features: '功能',
      faq: '常见问题',
      contact: '联系我们',
      login: '登录',
      register: '免费注册'
    },
    // 首页
    hero: {
      badge: 'AI 驱动的思维导图生成工具',
      title: '将您的文档',
      titleHighlight: '转化为清晰的思维导图',
      description: '上传文档或输入文本，让 AI 自动分析内容并生成结构化的思维导图，帮助您更好地理解和记忆信息。',
      startButton: '立即开始使用',
      usersCount: '已有超过 10,000+ 用户使用并信赖',
      mindMapLabel: '思维导图'
    },
    // 联系我们部分
    contact: {
      title: '有问题或建议？',
      subtitle: '我们很乐意听取您的反馈，请填写下面的表单与我们联系',
      info: {
        title: '联系信息',
        description: '填写表单，我们的团队将在24小时内与您联系。',
        email: '电子邮件',
        emailAddress: '15021538370@163.com',
        workingHours: '工作时间',
        workingTime: '周一至周五 9:00 - 18:00',
        twitter: 'X (Twitter)',
        twitterHandle: '@yihaoquan17888'
      },
      form: {
        name: '姓名',
        namePlaceholder: '您的姓名',
        email: '电子邮箱',
        emailPlaceholder: 'your@email.com',
        company: '公司/组织 (选填)',
        companyPlaceholder: '您的公司或组织名称',
        message: '消息内容',
        messagePlaceholder: '请详细描述您的需求或问题...',
        sending: '正在提交...',
        send: '发送消息',
        thankYou: '感谢您的留言',
        confirmation: '我们已收到您的消息，将尽快与您联系。'
      },
      partners: '值得信赖的合作伙伴'
    },
    // FAQ部分
    faq: {
      title: '常见问题',
      subtitle: '关于 MindFlow 思维导图生成器的常见问题解答',
      items: [
        {
          question: '什么是思维导图？',
          answer: '思维导图是一种图形化的思考工具，它通过分支结构将中心主题与相关概念连接起来，帮助用户组织信息、理清思路、增强记忆和促进创造性思考。'
        },
        {
          question: 'MindFlow 支持哪些文件格式？',
          answer: '目前 MindFlow 支持 TXT、PDF、DOCX、PPTX 和 Markdown (.md) 格式的文件。我们会根据用户需求持续增加更多格式的支持。'
        },
        {
          question: '如何导出生成的思维导图？',
          answer: '您可以将思维导图导出为 PNG 图片、JSON 格式或 Markdown 文档。在思维导图页面的顶部工具栏中，点击相应的导出按钮即可。'
        },
        {
          question: '思维导图的生成原理是什么？',
          answer: 'MindFlow 使用先进的自然语言处理技术分析文档内容，识别主题、关键点和层级关系，然后将这些信息转化为结构化的思维导图。'
        },
        {
          question: '我可以编辑生成的思维导图吗？',
          answer: '是的，生成的思维导图支持基本的编辑功能，您可以添加、删除节点，调整结构，以及自定义样式。'
        },
        {
          question: '有文件大小限制吗？',
          answer: '为了保证服务质量，目前上传文件的大小限制为 10MB。如果您需要处理更大的文件，请联系我们的客户支持。'
        },
        {
          question: 'AI 生成的思维导图准确度如何？',
          answer: '准确度取决于您输入文档的结构和清晰度。对于结构良好的文档，准确度通常超过90%。对于结构较不清晰的内容，AI会尽力识别关键概念和关系，但可能需要一些手动调整。'
        },
        {
          question: '我可以与他人协作编辑思维导图吗？',
          answer: '是的，您可以与团队成员或同事共享您的思维导图。在高级版中，您可以启用实时协作功能，允许多个用户同时编辑同一个思维导图。'
        },
        {
          question: '使用 MindFlow 时我的数据安全吗？',
          answer: '我们非常重视数据安全。所有上传的文档和生成的思维导图在传输和存储过程中都会被加密。我们不会与第三方共享您的数据，您可以随时删除您的数据。'
        }
      ]
    },
    // 功能部分
    features: {
      title: '强大功能，简单易用',
      subtitle: 'MindFlow 提供全面的思维导图生成和管理功能，满足您的各种需求',
      items: [
        {
          title: '多格式支持',
          description: '支持 TXT、PDF、DOCX、PPTX、Markdown 等多种文档格式，轻松导入您的内容。'
        },
        {
          title: 'AI 智能分析',
          description: '先进的 AI 技术自动分析文档结构和内容，提取关键信息和逻辑关系。'
        },
        {
          title: '快速生成',
          description: '秒级生成思维导图，无需手动绘制，节省大量时间和精力。'
        },
        {
          title: '多种导出选项',
          description: '支持导出为图片、JSON 或 Markdown 格式，方便分享和进一步编辑。'
        },
        {
          title: '自定义编辑',
          description: '生成后可以自由调整思维导图的结构和样式，满足个性化需求。'
        },
        {
          title: '便捷分享',
          description: '一键分享思维导图链接，与团队成员或朋友轻松协作。'
        },
        {
          title: '数据安全',
          description: '严格的数据保护措施，确保您的文档内容安全可靠。'
        },
        {
          title: '响应式设计',
          description: '完美适配桌面和移动设备，随时随地访问您的思维导图。'
        },
        {
          title: '云端存储',
          description: '自动保存到云端，无需担心数据丢失，随时查看历史记录。'
        }
      ],
      highlight: {
        title: 'AI 驱动的思维导图生成',
        description: 'MindFlow 利用先进的人工智能技术，自动分析文档内容，提取关键信息和逻辑关系，生成结构清晰的思维导图。',
        features: [
          '智能识别文档结构和层次关系',
          '自动提取关键概念和主题',
          '生成逻辑清晰的思维导图结构',
          '支持多语言文档分析'
        ]
      }
    },
    // 主要内容
    main: {
      title: '开始创建您的思维导图',
      description: '选择输入方式：直接输入文本或上传文档文件',
      textTab: '文本输入',
      fileTab: '文件上传',
      textPlaceholder: '请输入或粘贴您要分析的文本内容（至少50个字符）...\n\n为获得最佳效果，请使用层级结构，例如：\n• 标题和子标题\n• 编号或项目符号列表\n• 缩进段落\n• Markdown格式（# 标题，## 子标题，**粗体**，*斜体*，```代码```）\n\n支持多种语言，包括中文、英文、日文等。',
      charCount: '字符',
      langSupport: '支持中文、英文等多种语言',
      testButton: '点击测试',
      generateButton: '生成思维导图',
      processingButton: '生成中...',
      fileDropText: '选择文件或拖拽到页面任意位置',
      fileDropActive: '放开以上传文件',
      fileSelected: '已选择: ',
      fileSupport: '支持 TXT、PDF、DOCX、PPTX、Markdown 格式，最大 10MB',
      markdownSample: '尝试我们的 Markdown 示例',
      fileDragDetected: '💡 检测到文件拖拽，已自动切换到文件上传模式',
      selectFileAgain: '重新选择文件',
      uploadButton: '上传并生成',
      // 状态消息
      preparing: '准备中...',
      uploading: '上传中...',
      processing: '处理中...',
      parsing: '正在解析文本...',
      readingFile: '读取文件内容...',
      generating: '生成思维导图...',
      completed: '思维导图生成完成！',
      // 错误消息
      errorNoText: '请输入至少50个字符的文本内容',
      errorTextTooLong: '文本内容不能超过 {maxLength} 个字符',
      errorNoFile: '请选择文件',
      errorUnsupportedFile: '不支持的文件类型。请上传 TXT、PDF、DOCX、PPTX 或 Markdown (.md) 文件。',
      errorFileTooLarge: '文件大小不能超过 {maxSize} MB',
      errorParseFailed: '文件解析失败',
      errorGeneral: '处理失败，请重试',
      errorDocNotSupported: 'DOC文件格式暂不支持。DOC是较老的二进制格式，建议：\n1. 将文件转换为DOCX格式后重试\n2. 或者复制文件内容到文本输入框中\n3. 或者使用其他支持的格式（TXT、PDF、DOCX）',
      // 结果
      resultTitle: '生成的思维导图',
      resultDescription: '您可以查看和导出此思维导图「鼠标右键可以编辑节点」',
      resetButton: '重新开始'
    },
    // 思维导图查看器
    mindmap: {
      title: '思维导图',
      defaultTitle: '思维导图',
      loading: '正在初始化思维导图...',
      error: '初始化失败',
      backToHome: '返回首页',
      export: {
        json: '导出为 JSON',
        markdown: '导出为 Markdown',
        image: '导出为图片',
        filename: '思维导图'
      },
      edit: {
        save: '保存修改',
        viewMode: '切换到查看模式',
        title: '编辑模式使用提示：',
        tips: {
          doubleClick: '双击节点可以编辑文本内容',
          rightClick: '右键点击节点可以添加子节点、添加兄弟节点或删除节点',
          drag: '拖拽节点可以调整位置',
          save: '完成编辑后，点击保存按钮保存修改'
        }
      },
      controls: {
        zoomIn: '放大',
        zoomOut: '缩小',
        reset: '重置视图',
        back: '返回'
      },
      contextMenu: {
        addChild: '插入子节点',
        addSibling: '插入兄弟节点',
        focus: '专注',
        unfocus: '取消专注',
        summary: '摘要',
        link: '连接',
        bidirectionalLink: '双向连接',
        delete: '删除',
        edit: '编辑',
        style: '样式',
        copy: '复制',
        paste: '粘贴'
      }
    },
    // 页脚
    footer: {
      description: 'MindFlow 是一款智能思维导图生成工具，帮助您将文档和想法转化为结构化的思维导图。',
      product: '产品',
      features: '功能介绍',
      pricing: '价格方案',
      tutorials: '使用教程',
      changelog: '更新日志',
      support: '支持',
      helpCenter: '帮助中心',
      faq: '常见问题',
      contact: '联系我们',
      apiDocs: 'API 文档',
      company: '公司',
      about: '关于我们',
      privacy: '隐私政策',
      terms: '服务条款',
      careers: '加入我们',
      copyright: '© {year} MindFlow. 保留所有权利。'
    }
  }
};

// 获取翻译函数
export function getTranslation(lang: string) {
  return translations[lang as keyof typeof translations] || translations.en;
}