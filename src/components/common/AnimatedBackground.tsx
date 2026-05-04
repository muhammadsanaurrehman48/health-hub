import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
      };
    };

    // Animation loop
    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw vortex background
      const time = Date.now() * 0.0005;
      const gradient = ctx.createRadialGradient(
        mousePos.x,
        mousePos.y,
        0,
        mousePos.x,
        mousePos.y,
        600
      );
      
      // Get current theme colors
      const isDark = document.documentElement.classList.contains('dark');
      const color1 = isDark ? 'rgba(102, 204, 204, 0.1)' : 'rgba(26, 95, 122, 0.05)';
      const color2 = isDark ? 'rgba(102, 153, 204, 0.05)' : 'rgba(166, 72, 35, 0.02)';
      const color3 = isDark ? 'rgba(102, 204, 204, 0)' : 'rgba(26, 95, 122, 0)';

      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.5, color2);
      gradient.addColorStop(1, color3);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glow around cursor
      const glowSize = 100 + Math.sin(time * 3) * 20;
      const glowGradient = ctx.createRadialGradient(
        mousePos.x,
        mousePos.y,
        0,
        mousePos.x,
        mousePos.y,
        glowSize
      );
      
      const glowColor1 = isDark ? 'rgba(102, 204, 204, 0.3)' : 'rgba(26, 95, 122, 0.1)';
      const glowColor2 = isDark ? 'rgba(102, 204, 204, 0)' : 'rgba(26, 95, 122, 0)';
      
      glowGradient.addColorStop(0, glowColor1);
      glowGradient.addColorStop(1, glowColor2);

      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Occasionally create particles at mouse position
      if (Math.random() > 0.7) {
        particlesRef.current.push(createParticle(mousePos.x, mousePos.y));
      }

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Fade out
        p.life -= 1 / 60 / p.maxLife;

        // Draw particle
        const alpha = Math.max(0, p.life);
        ctx.fillStyle = isDark 
          ? `rgba(102, 204, 204, ${alpha * 0.5})`
          : `rgba(26, 95, 122, ${alpha * 0.3})`;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Remove dead particles
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      // Draw vortex lines
      ctx.strokeStyle = isDark ? 'rgba(102, 204, 204, 0.1)' : 'rgba(26, 95, 122, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const radius = 50 + i * 40 + Math.sin(time * 2 + i) * 20;
        ctx.arc(mousePos.x, mousePos.y, radius, time * 2, time * 2 + Math.PI * 0.5);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};
