'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import { Link } from '~/i18n/i18nConfig';
import { Button } from '~/ui/primitives/button';
// 示例图片数据
const sampleImages = [
  { alt: 'Sample 1', src: 'https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/simple-1.png' },
  { alt: 'Sample 2', src: 'https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/simple-2.png' },
  { alt: 'Sample 3', src: 'https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/simple-3.png' },
  { alt: 'Sample 4', src: 'https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/simple-4.png' },
];

export function HeroSection() {
  const t = useTranslations("Home");
  const [activePhoto, setActivePhoto] = useState<null | number>(null);

  return (
    <section
      className={`
        text-gray-900 text-white
        dark:bg-black dark:text-white
      `}
    >
      <div
        className={`
          mx-auto flex max-w-7xl flex-col items-center gap-8 px-4
          lg:flex-row lg:gap-16
        `}
      >
        <div
          className={`
            relative flex h-[555px] flex-1 items-center justify-center
          `}
        >
          <div
            className={`
              image-showcase relative flex h-full w-full items-center
              justify-center
            `}
          >
            {/* 原始黑白照片 */}
            <div
              className={`
                absolute z-10 overflow-hidden rounded-xl bg-white shadow-2xl
                grayscale
              `}
              style={{
                height: 'clamp(220px, 25vw, 352px)',
                left: '20%',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%) rotate(-6deg)',
                width: 'clamp(140px, 16vw, 224px)',
              }}
            >
              <Image
                alt="Original Black and White Photo"
                className="object-cover"
                fill
                src="https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/original-bw.png"
              />
            </div>

            {/* 彩色照片堆叠容器 */}
            <div
              className={`
                group absolute flex items-center justify-center transition-all
                duration-500
                hover:scale-103
              `}
              onMouseLeave={() => setActivePhoto(null)}
              style={{
                height: 'clamp(232px, 26.1vw, 387px)',
                left: '80%',
                perspective: '1800px',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%)',
                width: 'clamp(300px, 35vw, 450px)',
              }}
            >
              {/* 彩色照片1 - 左侧 */}
              <button
                aria-label="View colorized photo 1"
                className={`
                  absolute cursor-pointer overflow-hidden rounded-xl bg-white
                  shadow-xl transition-transform duration-300
                  ${activePhoto === 0 ? 'z-10 scale-[1.2]' : activePhoto !== null ? `
                    translate-x-[-12%] rotate-[-35deg]
                  ` : `
                    group-hover:translate-x-[-12%] group-hover:rotate-[-35deg]
                  `}
                `}
                onClick={() => setActivePhoto(0)}
                style={{
                  backfaceVisibility: 'hidden',
                  border: 'none',
                  boxShadow: activePhoto === 0 ? '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)' : '',
                  height: 'clamp(186px, 21vw, 310px)',
                  padding: 0,
                  transform: activePhoto === 0
                    ? 'scale(1.22) translateZ(clamp(15px, 1.8vw, 25px))'
                    : 'translateX(clamp(-75px, -8.5vw, -115px)) translateY(clamp(10px, 1.2vw, 20px)) rotate(-40deg) translateZ(clamp(-50px, -6vw, -85px))',
                  transformOrigin: 'center center',
                  width: 'clamp(120px, 13.5vw, 200px)',
                  zIndex: activePhoto === 0 ? 10 : 2,
                }}
                type="button"
              >
                <Image
                  alt="Colorized Photo 1"
                  className="object-cover"
                  fill
                  src="https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/colorized-1.png"
                />
              </button>
              {/* 彩色照片2 - 中间突出 */}
              <button
                aria-label="View colorized photo 2"
                className={`
                  absolute cursor-pointer overflow-hidden rounded-xl bg-white
                  transition-all duration-300
                  ${activePhoto === 1 ? 'z-10 scale-[1.2]' : activePhoto !== null ? '' : `
                    group-hover:scale-[1.15]
                  `}
                `}
                onClick={() => setActivePhoto(1)}
                style={{
                  backfaceVisibility: 'hidden',
                  border: 'none',
                  boxShadow: '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)',
                  height: 'clamp(186px, 21vw, 310px)',
                  padding: 0,
                  transform: activePhoto === 1 || (activePhoto === null)
                    ? 'scale(1.22) translateZ(clamp(15px, 1.8vw, 25px))'
                    : 'translateZ(0)',
                  transformOrigin: 'center center',
                  width: 'clamp(120px, 13.5vw, 200px)',
                  zIndex: activePhoto === 1 ? 10 : (activePhoto === null ? 3 : 1),
                }}
                type="button"
              >
                <Image
                  alt="Colorized Photo 2"
                  className="object-cover"
                  fill
                  src="https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/colorized-2.png"
                />
              </button>

              {/* 彩色照片3 - 右侧 */}
              <button
                aria-label="View colorized photo 3"
                className={`
                  absolute cursor-pointer overflow-hidden rounded-xl bg-white
                  shadow-xl transition-transform duration-300
                  ${activePhoto === 2 ? 'z-10 scale-[1.2]' : activePhoto !== null ? `
                    translate-x-[12%] rotate-[35deg]
                  ` : `group-hover:translate-x-[12%] group-hover:rotate-[35deg]`}
                `}
                onClick={() => setActivePhoto(2)}
                style={{
                  backfaceVisibility: 'hidden',
                  border: 'none',
                  boxShadow: activePhoto === 2 ? '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)' : '',
                  height: 'clamp(186px, 21vw, 310px)',
                  padding: 0,
                  transform: activePhoto === 2
                    ? 'scale(1.22) translateZ(clamp(15px, 1.8vw, 25px))'
                    : 'translateX(clamp(75px, 8.5vw, 115px)) translateY(clamp(10px, 1.2vw, 20px)) rotate(40deg) translateZ(clamp(-50px, -6vw, -85px))',
                  transformOrigin: 'center center',
                  width: 'clamp(120px, 13.5vw, 200px)',
                  zIndex: activePhoto === 2 ? 10 : 2,
                }}
                type="button"
              >
                <Image
                  alt="Colorized Photo 3"
                  className="object-cover"
                  fill
                  src="https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/colorized-3.png"
                />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`
            mx-auto flex max-w-md flex-1 flex-col items-center justify-center
            gap-4 text-center
            lg:mx-0 lg:-translate-x-4 lg:transform
          `}
        >
          <h1
            className={`
              animate-gradient-x bg-gradient-to-r from-blue-500 via-purple-500
              to-pink-500 bg-clip-text text-3xl leading-tight font-bold
              text-transparent
              md:text-4xl
              lg:text-5xl
            `}
          >
            {t('heroTitle')}
          </h1>
          <p
            className={`
              max-w-sm text-base text-gray-600
              md:text-lg
              dark:text-gray-300
            `}
          >
            {t('heroDescription')}
          </p>
          <div className="my-1 flex items-center gap-2">
            <div className="flex text-yellow-400">
              <span>★★★★★</span>
            </div>
            <span
              className={`
                text-sm text-gray-600
                dark:text-gray-300
              `}
            >
              {t('rating')}
            </span>
          </div>
          <Link href="/generate">
            <Button
              className="px-12 py-4 text-lg font-semibold"
              color="primary"
              size="lg"
            >
              {t('colorizePhoto')}
            </Button>
          </Link>
          <p
            className={`
              mt-2 text-sm text-gray-500
              dark:text-gray-400
            `}
          >
            {' '}
            {t('sampleText')}
          </p>
          <div className="flex space-x-3">
            {sampleImages.map(item => (
              <button
                aria-label={`View sample ${item.alt}`}
                className={`
                  border-default-200 h-16 w-16 cursor-pointer overflow-hidden
                  rounded-lg border transition-transform duration-200
                  dark:border-default-100
                  hover:scale-110 hover:border-primary
                `}
                key={item.src}
                style={{ border: 'none', padding: 0 }}
                type="button"
              >
                <Image
                  alt={item.alt}
                  className="h-full w-full object-cover"
                  height={80}
                  src={item.src}
                  width={80}
                />
              </button>
            ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
