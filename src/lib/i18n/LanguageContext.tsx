'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, getTranslation } from './translations';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string | string[] | Record<string, unknown>;
};

// 创建上下文
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => { },
  t: () => '',
});

// 提供者组件
export function LanguageProvider({ children }: { children: ReactNode }) {
  // 默认使用英语，但检查本地存储中是否有保存的语言设置
  const [language, setLanguageState] = useState('en');

  // 在客户端初始化时，强制使用英语作为默认语言
  useEffect(() => {
    // 强制设置为英语，忽略本地存储中的设置
    setLanguageState('en');
    localStorage.setItem('language', 'en');
  }, []);

  // 设置语言并保存到localStorage
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    // 设置 HTML 文档的 lang 属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  // 翻译函数
  const t = (key: string): string | string[] | Record<string, unknown> => {
    const keys = key.split('.');
    let value: Record<string, unknown> = getTranslation(language);

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 自定义Hook，方便在组件中使用
export function useLanguage() {
  return useContext(LanguageContext);
}