"use client";

import { useEffect, useState } from 'react';

interface Star {
  animationDelay: number;
  id: number;
  opacity: number;
  size: number;
  x: number;
  y: number;
}

interface StarfieldProps {
  className?: string;
}

export function Starfield({ className = "" }: StarfieldProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [brightStars, setBrightStars] = useState<{ delay: number; x: number; y: number; }[]>([]);
  const [mounted, setMounted] = useState(false);

  // 使用种子随机数生成器确保一致性
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // 生成随机星星位置
  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      animationDelay: seededRandom(i * 1000) * 3,
      id: i,
      opacity: seededRandom(i * 1001) * 0.8 + 0.2,
      size: seededRandom(i * 1002) * 2 + 0.5,
      x: seededRandom(i * 1003) * 100,
      y: seededRandom(i * 1004) * 100,
    }));
  };

  const generateBrightStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      delay: seededRandom(i * 2002) * 4,
      x: seededRandom(i * 2000) * 100,
      y: seededRandom(i * 2001) * 100,
    }));
  };

  useEffect(() => {
    setStars(generateStars(150));
    setBrightStars(generateBrightStars(20));
    setMounted(true);
  }, []);

  // 在服务器端或未挂载时不渲染星星
  if (!mounted) {
    return (
      <div className={`
        absolute inset-0 overflow-hidden text-gray-400
        dark:text-white
        ${className}
      `}>
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <style>
              {`
                @keyframes twinkle {
                  0%, 100% { opacity: 0.2; }
                  50% { opacity: 1; }
                }
                .star {
                  animation: twinkle 3s infinite;
                }
              `}
            </style>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className={`
      absolute inset-0 overflow-hidden text-gray-400
      dark:text-white
      ${className}
    `}>
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            {`
              @keyframes twinkle {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
              }
              .star {
                animation: twinkle 3s infinite;
              }
            `}
          </style>
        </defs>
        {stars.map((star) => (
          <circle
            className="star"
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            fill="currentColor"
            key={star.id}
            r={star.size}
            style={{
              animationDelay: `${star.animationDelay}s`,
              opacity: star.opacity,
            }}
          />
        ))}

        {/* 添加一些较大的闪烁星星 */}
        {brightStars.map((brightStar, i) => (
          <g key={`bright-${i}`}>
            <circle
              className="star"
              cx={`${brightStar.x}%`}
              cy={`${brightStar.y}%`}
              fill="white"
              r="1.5"
              style={{
                animationDelay: `${brightStar.delay}s`,
                opacity: 0.9,
              }}
            />
            <circle
              className="star"
              cx={`${brightStar.x}%`}
              cy={`${brightStar.y}%`}
              fill="#60a5fa"
              r="0.5"
              style={{
                animationDelay: `${brightStar.delay + 0.5}s`,
                opacity: 0.7,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}