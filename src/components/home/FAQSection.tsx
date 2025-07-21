'use client';
//这是一盒测试
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // 根据当前语言选择相应的 FAQ 数据
  const faqData = language === 'zh' ? [
    {
      question: '什么是思维导图？',
      answer: '思维导图是一种图形化的思考工具，它通过分支结构将中心主题与相关概念连接起来，帮助用户组织信息、理清思路、增强记忆和促进创造性思考。'
    },
    {
      question: 'MindFlow 支持哪些文件格式？',
      answer: '目前 MindFlow 支持 TXT、PDF、DOCX 和 PPTX 格式的文件。我们会根据用户需求持续增加更多格式的支持。'
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
  ] : [
    {
      question: 'What is a mind map?',
      answer: 'A mind map is a graphical thinking tool that connects a central topic with related concepts through a branching structure, helping users organize information, clarify thoughts, enhance memory, and promote creative thinking.'
    },
    {
      question: 'Which file formats does MindFlow support?',
      answer: 'Currently, MindFlow supports TXT, PDF, DOCX, and PPTX file formats. We continuously add support for more formats based on user needs.'
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
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-24 overflow-hidden bg-black text-white">
      {/* 背景网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* 渐变光晕 */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent inline-block mb-6">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqData.map((faq: FAQItem, index: number) => (
            <div 
              key={index} 
              className="mb-4"
            >
              <button
                className={`w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none rounded-xl border ${
                  openIndex === index 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                } transition-all duration-200`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-white">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 py-4 bg-white/5 border border-t-0 border-white/10 rounded-b-xl">
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 装饰元素 */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full border border-white/5 opacity-50"></div>
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border border-white/5 opacity-50"></div>
      </div>
    </section>
  );
}