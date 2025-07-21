'use client';

import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className = '' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置canvas尺寸为窗口大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 创建粒子
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        
        // 使用品牌颜色
        const colors = [
          'rgba(59, 130, 246, 0.3)', // blue-500
          'rgba(124, 58, 237, 0.3)', // purple-600
          'rgba(236, 72, 153, 0.3)', // pink-500
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // 边界检查
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // 创建连线
    function connect(particles: Particle[]) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            if (!ctx) return;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    // 初始化粒子
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 30)); // 根据屏幕宽度调整粒子数量
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // 动画循环
    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      
      connect(particles);
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 z-0 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}

// 波浪动画背景
export function WaveBackground({ className = '' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置canvas尺寸为窗口大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 波浪参数
    const waves = [
      { y: canvas.height * 0.65, length: 0.01, amplitude: 40, speed: 0.003, color: 'rgba(59, 130, 246, 0.1)' },
      { y: canvas.height * 0.68, length: 0.012, amplitude: 30, speed: 0.004, color: 'rgba(124, 58, 237, 0.1)' },
      { y: canvas.height * 0.71, length: 0.013, amplitude: 25, speed: 0.005, color: 'rgba(236, 72, 153, 0.1)' },
    ];
    
    let time = 0;
    
    // 绘制波浪
    function drawWave(wave: typeof waves[0]) {
      if (!ctx || !canvas) return;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      for (let x = 0; x < canvas.width; x++) {
        const y = wave.y + Math.sin(x * wave.length + time * wave.speed) * wave.amplitude;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fillStyle = wave.color;
      ctx.fill();
    }
    
    // 动画循环
    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (const wave of waves) {
        drawWave(wave);
      }
      
      time += 0.05;
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 z-0 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}

// 渐变网格背景
export function GradientGridBackground({ className = '' }: AnimatedBackgroundProps) {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>
      <div className="absolute bottom-32 left-12 -z-10 h-[210px] w-[210px] rounded-full bg-pink-400 opacity-20 blur-[100px]"></div>
    </div>
  );
}