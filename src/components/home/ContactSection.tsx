'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ContactSection() {
  const { t } = useLanguage();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // 重置表单
    setTimeout(() => {
      setIsSubmitted(false);
      setFormState({
        name: '',
        email: '',
        company: '',
        message: '',
      });
    }, 3000);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-black text-white py-24">
      {/* 背景网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* 渐变光晕 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent inline-block mb-6">
              {t('contact.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-1 border border-white/10 overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* 左侧信息 */}
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 lg:p-12 rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none">
                <h3 className="text-2xl font-bold text-white mb-6">{t('contact.info.title')}</h3>
                <p className="text-white/80 mb-8">
                  {t('contact.info.description')}
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">{t('contact.info.email')}</h4>
                    <a href="mailto:15021538370@163.com" className="text-white/80 hover:text-white transition-colors">15021538370@163.com</a>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">X (Twitter)</h4>
                    <a href="https://twitter.com/yihaoquan17888" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">@yihaoquan17888</a>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">{t('contact.info.workingHours')}</h4>
                    <p className="text-white/80">{t('contact.info.workingTime')}</p>
                  </div>
                </div>
                
                {/* 装饰圆圈 */}
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border border-white/10"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full border border-white/10"></div>
              </div>
              
              {/* 右侧表单 */}
              <div className="lg:col-span-3 p-8 lg:p-12">
                {isSubmitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('contact.form.thankYou')}</h3>
                    <p className="text-gray-400">
                      {t('contact.form.confirmation')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                          {t('contact.form.name')}
                        </label>
                        <Input 
                          id="name"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          placeholder={t('contact.form.namePlaceholder')}
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                          {t('contact.form.email')}
                        </label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={formState.email}
                          onChange={handleChange}
                          placeholder={t('contact.form.emailPlaceholder')}
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                        {t('contact.form.company')}
                      </label>
                      <Input 
                        id="company"
                        name="company"
                        value={formState.company}
                        onChange={handleChange}
                        placeholder={t('contact.form.companyPlaceholder')}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                        {t('contact.form.message')}
                      </label>
                      <Textarea 
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        placeholder={t('contact.form.messagePlaceholder')}
                        required
                        className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('contact.form.sending')}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          {t('contact.form.send')}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
          
          {/* 品牌标语 */}
          <div className="mt-24 text-center">
            <p className="text-xl font-medium text-white mb-4">{t('contact.partners')}</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50">
              {['Microsoft', 'Google', 'Amazon', 'Adobe', 'IBM'].map((brand) => (
                <div key={brand} className="text-xl font-bold text-gray-400">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}