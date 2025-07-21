'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Github, Twitter, Mail, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { GradientGridBackground } from '@/components/ui/animated-background';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">MindFlow</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {t('nav.features')}
              </Link>
              <Link href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {t('nav.faq')}
              </Link>
              <Link href="#contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {t('nav.contact')}
              </Link>
            </nav>

            {/* Language Switcher */}
            <div className="hidden md:flex items-center mr-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-1 text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'en' ? '中文' : 'English'}</span>
              </Button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                {t('nav.login')}
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                {t('nav.register')}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-md">
            <div className="container mx-auto px-4 py-3 space-y-1">
              <Link href="/" className="block py-2 text-base font-medium text-gray-300 hover:text-white">
                {t('nav.home')}
              </Link>
              <Link href="#features" className="block py-2 text-base font-medium text-gray-300 hover:text-white">
                {t('nav.features')}
              </Link>
              <Link href="#faq" className="block py-2 text-base font-medium text-gray-300 hover:text-white">
                {t('nav.faq')}
              </Link>
              <Link href="#contact" className="block py-2 text-base font-medium text-gray-300 hover:text-white">
                {t('nav.contact')}
              </Link>
              
              {/* 移动端语言切换 */}
              <Button 
                variant="ghost" 
                className="w-full justify-start py-2 text-base font-medium text-gray-300 hover:text-white"
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              >
                <Globe className="h-4 w-4 mr-2" />
                <span>{language === 'en' ? '切换到中文' : 'Switch to English'}</span>
              </Button>
              
              <div className="pt-4 flex space-x-3">
                <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-white/10">
                  {t('nav.login')}
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                  {t('nav.register')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white border-t border-white/10">
        <div className="relative overflow-hidden">
          {/* 背景网格 */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          {/* 渐变光晕 */}
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
          
          <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">MindFlow</span>
                </div>
                <p className="text-gray-400 text-sm">
                  {t('footer.description')}
                </p>
                <div className="flex space-x-4">
                  <a href="https://twitter.com/yihaoquan17888" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="mailto:15021538370@163.com" className="text-gray-500 hover:text-gray-300 transition-colors">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">{t('footer.product')}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.features')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.pricing')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.tutorials')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.changelog')}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">{t('footer.support')}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.helpCenter')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.faq')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.contact')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.apiDocs')}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">{t('footer.company')}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.about')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.privacy')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.terms')}
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {t('footer.careers')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-8">
              <p className="text-center text-sm text-gray-500">
                {t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}