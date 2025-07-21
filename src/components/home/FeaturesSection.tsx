'use client';

import React from 'react';
import { 
  FileText, 
  Brain, 
  Zap, 
  Download, 
  PenTool, 
  Share2, 
  Lock, 
  Smartphone, 
  Cloud
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FeatureCard } from './FeatureCard';
import { FeatureCardCenter } from './FeatureCardCenter';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay = 0 }) => {
  return (
    <div 
      className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export function FeaturesSection() {
  const { t, language } = useLanguage();
  
  const featureIcons = [
    <FileText key="icon-1" className="h-6 w-6 text-blue-400" />,
    <Brain key="icon-2" className="h-6 w-6 text-purple-400" />,
    <Zap key="icon-3" className="h-6 w-6 text-yellow-400" />,
    <Download key="icon-4" className="h-6 w-6 text-green-400" />,
    <PenTool key="icon-5" className="h-6 w-6 text-red-400" />,
    <Share2 key="icon-6" className="h-6 w-6 text-indigo-400" />,
    <Lock key="icon-7" className="h-6 w-6 text-gray-400" />,
    <Smartphone key="icon-8" className="h-6 w-6 text-teal-400" />,
    <Cloud key="icon-9" className="h-6 w-6 text-blue-300" />
  ];
  
  // 获取特性项目，确保它是一个数组
  const featuresItems = t('features.items');
  const features = Array.isArray(featuresItems) 
    ? featuresItems.map((item: { title: string; description: string }, index: number) => ({
        icon: featureIcons[index],
        title: item.title,
        description: item.description
      }))
    : [];

  // 获取高亮特性，确保它是一个数组
  const highlightFeatures = t('features.highlight.features');
  const highlightFeaturesList = Array.isArray(highlightFeatures) 
    ? highlightFeatures 
    : [];

  return (
    <section id="features" className="relative py-24 overflow-hidden bg-black text-white">
      {/* 背景网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* 渐变光晕 */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent inline-block mb-6">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {/* Top row */}
            <div className="flex justify-center">
              <FeatureCard
                icon={features[1].icon} // AI Intelligent Analysis
                title={{
                  en: "AI Intelligent Analysis",
                  zh: "AI 智能分析"
                }}
                description={{
                  en: "Advanced AI technology automatically analyzes document structure and content, extracting key information and logical relationships.",
                  zh: "先进的 AI 技术自动分析文档结构和内容，提取关键信息和逻辑关系。"
                }}
                language={language}
              />
            </div>
            <div className="flex justify-center md:row-span-2 col-span-1">
              {/* Center card - larger */}
              <FeatureCardCenter
                icon={features[2].icon} // Fast Generation
                title={{
                  en: "Fast Generation",
                  zh: "快速生成"
                }}
                description={{
                  en: "Generate mind maps in seconds, no need for manual drawing, saving time and effort so you can focus on content rather than tools.",
                  zh: "秒级生成思维导图，无需手动绘制，节省大量时间和精力，让您专注于内容而非工具。"
                }}
                language={language}
              />
            </div>
            <div className="flex justify-center">
              <FeatureCard
                icon={features[4].icon} // Custom Editing
                title={{
                  en: "Custom Editing",
                  zh: "自定义编辑"
                }}
                description={{
                  en: "After generation, freely adjust the structure and style of the mind map to meet personalized needs.",
                  zh: "生成后可以自由调整思维导图的结构和样式，满足个性化需求。"
                }}
                language={language}
              />
            </div>
            
            {/* Bottom row */}
            <div className="flex justify-center">
              <FeatureCard
                icon={features[6].icon} // Lock icon for security
                title={{
                  en: "Local Processing & Security",
                  zh: "本地处理与安全"
                }}
                description={{
                  en: "All data is processed locally on your device without cloud uploads, ensuring complete privacy and security of your information.",
                  zh: "所有数据在您的设备上本地处理，无需上传云端，确保您的信息完全私密和安全。"
                }}
                language={language}
              />
            </div>
            <div className="flex justify-center">
              <FeatureCard
                icon={features[0].icon} // Multiple Format Support
                title={{
                  en: "Multiple Format Support",
                  zh: "多格式支持"
                }}
                description={{
                  en: "Support TXT, PDF, DOCX, PPTX and other document formats, easily import your content.",
                  zh: "支持 TXT、PDF、DOCX、PPTX 等多种文档格式，轻松导入您的内容。"
                }}
                language={language}
              />
            </div>
          </div>
        </div>
        
        {/* 特性亮点 */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-white mb-4">{t('features.highlight.title')}</h3>
                <p className="text-gray-300 mb-6">
                  {t('features.highlight.description')}
                </p>
                <ul className="space-y-3">
                  {highlightFeaturesList.map((item: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-1">
                        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                      </div>
                      <span className="ml-3 text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 h-64 bg-black/20 rounded-xl border border-white/10 flex items-center justify-center">
                <Brain className="h-24 w-24 text-blue-400/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}