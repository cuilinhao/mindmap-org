'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();

  const scrollToContent = () => {
    const contentElement = document.getElementById('main-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-[90vh] flex items-center">
      {/* 动画背景 */}
      <AnimatedBackground />

      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* 渐变光晕 */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>

      <div className="relative z-10 container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-blue-200 backdrop-blur-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
              <span className="text-blue-100">{t('hero.badge') as string}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              {t('hero.title') as string}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mt-2">
                {t('hero.titleHighlight') as string}
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              {t('hero.description') as string}
            </p>

            <div className="flex justify-center lg:justify-start">
              <Button
                onClick={scrollToContent}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
              >
                {t('hero.startButton') as string}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 text-sm text-gray-400">
              <p>{t('hero.usersCount') as string}</p>
            </div>
          </div>

          <div className="relative h-[400px] flex items-center justify-center">
            {/* SVG动效 */}
            <svg className="text-muted w-[120%] h-[120%] mx-auto" width="100%" height="100%" viewBox="0 0 200 100">
              <g stroke="currentColor" fill="none" strokeWidth="0.4" strokeDasharray="100 100" pathLength="100" markerStart="url(#cpu-circle-marker)">
                <path id="path1" strokeDasharray="100 100" pathLength="100" d="M 10 20 h 79.5 q 5 0 5 5 v 30"></path>
                <path id="path2" strokeDasharray="100 100" pathLength="100" d="M 180 10 h -69.7 q -5 0 -5 5 v 30"></path>
                <path id="path3" d="M 130 20 v 21.8 q 0 5 -5 5 h -10"></path>
                <path id="path4" d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50"></path>
                <path id="path5" strokeDasharray="100 100" pathLength="100" d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20"></path>
                <path id="path6" d="M 94.8 95 v -36"></path>
                <path id="path7" d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14"></path>
                <path id="path8" d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20"></path>
                <animate attributeName="strokeDashoffset" from="100" to="0" dur="1s" fill="freeze" calcMode="spline" keySplines="0.25,0.1,0.5,1" keyTimes="0; 1"></animate>
              </g>

              {/* 添加沿线移动的彩色点 */}
              <circle r="2" fill="#00E8ED">
                <animateMotion dur="3s" repeatCount="indefinite" restart="whenNotActive">
                  <mpath href="#path1" />
                </animateMotion>
              </circle>

              <circle r="2" fill="#FFD800">
                <animateMotion dur="4s" repeatCount="indefinite" restart="whenNotActive">
                  <mpath href="#path2" />
                </animateMotion>
              </circle>

              <circle r="2" fill="#FF008B">
                <animateMotion dur="3.5s" repeatCount="indefinite" restart="whenNotActive">
                  <mpath href="#path3" />
                </animateMotion>
              </circle>

              <circle r="2" fill="white">
                <animateMotion dur="4.5s" repeatCount="indefinite" restart="whenNotActive">
                  <mpath href="#path4" />
                </animateMotion>
              </circle>

              <circle r="2" fill="#22c55e">
                <animateMotion dur="5s" repeatCount="indefinite" restart="whenNotActive">
                  <mpath href="#path5" />
                </animateMotion>
              </circle>

              <circle r="2" fill="#f97316">
                <animateMotion dur="2.5s" repeatCount="indefinite" restart="whenNotActive">
                  <mpath href="#path6" />
                </animateMotion>
              </circle>

              <circle r="2" fill="#06b6d4">
                <animateMotion dur="6s" repeatCount="indefinite" restart="whenNotActive">
                  <mpath href="#path7" />
                </animateMotion>
              </circle>

              <circle r="2" fill="#f43f5e">
                <animateMotion dur="4.2s" repeatCount="indefinite" restart="whenNotActive">
                  <mpath href="#path8" />
                </animateMotion>
              </circle>
              <g mask="url(#cpu-mask-1)">
                <circle className="cpu-architecture cpu-line-1" cx="0" cy="0" r="8" fill="url(#cpu-blue-grad)"></circle>
              </g>
              <g mask="url(#cpu-mask-2)">
                <circle className="cpu-architecture cpu-line-2" cx="0" cy="0" r="8" fill="url(#cpu-yellow-grad)"></circle>
              </g>
              <g mask="url(#cpu-mask-3)">
                <circle className="cpu-architecture cpu-line-3" cx="0" cy="0" r="8" fill="url(#cpu-pinkish-grad)"></circle>
              </g>
              <g mask="url(#cpu-mask-4)">
                <circle className="cpu-architecture cpu-line-4" cx="0" cy="0" r="8" fill="url(#cpu-white-grad)"></circle>
              </g>
              <g mask="url(#cpu-mask-5)">
                <circle className="cpu-architecture cpu-line-5" cx="0" cy="0" r="8" fill="url(#cpu-green-grad)"></circle>
              </g>
              <g mask="url(#cpu-mask-6)">
                <circle className="cpu-architecture cpu-line-6" cx="0" cy="0" r="8" fill="url(#cpu-orange-grad)"></circle>
              </g>
              <g mask="url(#cpu-mask-7)">
                <circle className="cpu-architecture cpu-line-7" cx="0" cy="0" r="8" fill="url(#cpu-cyan-grad)"></circle>
              </g>
              <g mask="url(#cpu-mask-8)">
                <circle className="cpu-architecture cpu-line-8" cx="0" cy="0" r="8" fill="url(#cpu-rose-grad)"></circle>
              </g>
              <g>
                <g fill="url(#cpu-connection-gradient)">
                  <rect x="93" y="37" width="2.5" height="5" rx="0.7"></rect>
                  <rect x="104" y="37" width="2.5" height="5" rx="0.7"></rect>
                  <rect x="116.3" y="44" width="2.5" height="5" rx="0.7" transform="rotate(90 116.25 45.5)"></rect>
                  <rect x="122.8" y="44" width="2.5" height="5" rx="0.7" transform="rotate(90 116.25 45.5)"></rect>
                  <rect x="104" y="16" width="2.5" height="5" rx="0.7" transform="rotate(180 105.25 39.5)"></rect>
                  <rect x="114.5" y="16" width="2.5" height="5" rx="0.7" transform="rotate(180 105.25 39.5)"></rect>
                  <rect x="80" y="-13.6" width="2.5" height="5" rx="0.7" transform="rotate(270 115.25 19.5)"></rect>
                  <rect x="87" y="-13.6" width="2.5" height="5" rx="0.7" transform="rotate(270 115.25 19.5)"></rect>
                </g>
                <rect x="85" y="40" width="30" height="20" rx="2" fill="#181818" filter="url(#cpu-light-shadow)"></rect>
                <text x="92" y="52.5" fontSize="8" fill="url(#cpu-text-gradient)" fontWeight="600" letterSpacing="0.05em">AI</text>
              </g>
              <defs>
                <mask id="cpu-mask-1">
                  <path d="M 10 20 h 79.5 q 5 0 5 5 v 24" strokeWidth="0.5" stroke="white"></path>
                </mask>
                <mask id="cpu-mask-2">
                  <path d="M 180 10 h -69.7 q -5 0 -5 5 v 24" strokeWidth="0.5" stroke="white"></path>
                </mask>
                <mask id="cpu-mask-3">
                  <path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" strokeWidth="0.5" stroke="white"></path>
                </mask>
                <mask id="cpu-mask-4">
                  <path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" strokeWidth="0.5" stroke="white"></path>
                </mask>
                <mask id="cpu-mask-5">
                  <path d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" strokeWidth="0.5" stroke="white"></path>
                </mask>
                <mask id="cpu-mask-6">
                  <path d="M 94.8 95 v -36" strokeWidth="0.5" stroke="white"></path>
                </mask>
                <mask id="cpu-mask-7">
                  <path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" strokeWidth="0.5" stroke="white"></path>
                </mask>
                <mask id="cpu-mask-8">
                  <path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" strokeWidth="0.5" stroke="white"></path>
                </mask>
                <radialGradient id="cpu-blue-grad" fx="1">
                  <stop offset="0%" stopColor="#00E8ED"></stop>
                  <stop offset="50%" stopColor="#08F"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </radialGradient>
                <radialGradient id="cpu-yellow-grad" fx="1">
                  <stop offset="0%" stopColor="#FFD800"></stop>
                  <stop offset="50%" stopColor="#FFD800"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </radialGradient>
                <radialGradient id="cpu-pinkish-grad" fx="1">
                  <stop offset="0%" stopColor="#830CD1"></stop>
                  <stop offset="50%" stopColor="#FF008B"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </radialGradient>
                <radialGradient id="cpu-white-grad" fx="1">
                  <stop offset="0%" stopColor="white"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </radialGradient>
                <radialGradient id="cpu-green-grad" fx="1">
                  <stop offset="0%" stopColor="#22c55e"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </radialGradient>
                <radialGradient id="cpu-orange-grad" fx="1">
                  <stop offset="0%" stopColor="#f97316"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </radialGradient>
                <radialGradient id="cpu-cyan-grad" fx="1">
                  <stop offset="0%" stopColor="#06b6d4"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </radialGradient>
                <radialGradient id="cpu-rose-grad" fx="1">
                  <stop offset="0%" stopColor="#f43f5e"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </radialGradient>
                <filter id="cpu-light-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="1.5" dy="1.5" stdDeviation="1" floodColor="black" floodOpacity="0.1"></feDropShadow>
                </filter>
                <marker id="cpu-circle-marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="18" markerHeight="18">
                  <circle id="innerMarkerCircle" cx="5" cy="5" r="2" fill="black" stroke="#232323" strokeWidth="0.5">
                    <animate attributeName="r" values="0; 3; 2" dur="0.5s"></animate>
                  </circle>
                </marker>
                <linearGradient id="cpu-connection-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F4F4F"></stop>
                  <stop offset="60%" stopColor="#121214"></stop>
                </linearGradient>
                <linearGradient id="cpu-text-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#666666">
                    <animate attributeName="offset" values="-2; -1; 0" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"></animate>
                  </stop>
                  <stop offset="25%" stopColor="white">
                    <animate attributeName="offset" values="-1; 0; 1" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"></animate>
                  </stop>
                  <stop offset="50%" stopColor="#666666">
                    <animate attributeName="offset" values="0; 1; 2;" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"></animate>
                  </stop>
                </linearGradient>
              </defs>
            </svg>


          </div>
        </div>
      </div>
    </div>
  );
}