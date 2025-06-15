"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "~/ui/primitives/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/ui/primitives/carousel";

// 对比图片数据
const beforeAfterImages = [
  {
    after:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/after-1.png",
    alt: "Comparison 1",
    before:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/before-1.png",
  },
  {
    after:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/after-2.png",
    alt: "Comparison 2",
    before:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/before-2.png",
    hasNewPalette: true,
  },
  {
    after:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/after-3.png",
    alt: "Comparison 3",
    before:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/before-3.png",
  },
  {
    after:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/after-4.png",
    alt: "Comparison 4",
    before:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/before-4.png",
    hasNewPalette: true,
  },
  {
    after:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/after-5.png",
    alt: "Comparison 5",
    before:
      "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/before-5.png",
    hasNewPalette: true,
  },
];

export function ExperienceDifferenceSection() {
  const t = useTranslations("Home");
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 自动滚动功能
  useEffect(() => {
    if (!api) {
      return;
    }

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          api.scrollNext();
        }
      }, 3000); // 每3秒滚动一次
    };

    startAutoScroll();

    // 组件卸载时清除定时器
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [api, isPaused]);

  // 设置循环滚动
  useEffect(() => {
    if (!api) {
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    const handleSelect = () => {
      // 如果到达最后一个，自动回到第一个
      if (api.selectedScrollSnap() === api.scrollSnapList().length - 1) {
        // 使用setTimeout避免立即滚动造成的视觉跳跃
        timeoutId = setTimeout(() => {
          api.scrollTo(0, false);
        }, 500);
      }
    };

    // 设置循环滚动
    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [api]);

  // 鼠标悬停处理函数
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <section className="py-20">
      <div className="container-fluid mx-auto px-0">
        <div className="space-y-8 text-center">
          <h2
            className={`
              text-3xl font-bold text-foreground
              lg:text-4xl
            `}
          >
            {t("experienceTheDifference")}
          </h2>

          {/* Category Buttons */}
          {/* <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <Button
                className="capitalize"
                key={category}
                onClick={() => setActiveCategory(index)}
                variant={activeCategory === index ? 'default' : 'outline'}
              >
                {t(`${category}`)}
              </Button>
            ))}
          </div> */}

          {/* Before/After Slider */}
          <div
            className="relative w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`
                pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24
                bg-gradient-to-r from-background to-transparent
              `}
            />
            <div
              className={`
                pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24
                bg-gradient-to-l from-background to-transparent
              `}
            />
            <Carousel
              className="w-full"
              opts={{
                align: "center",
                loop: true,
              }}
              setApi={setApi}
            >
              <CarouselContent className="px-4">
                {beforeAfterImages.map((item, index) => (
                  <CarouselItem
                    className={`
                      md:basis-1/2
                      lg:basis-1/3
                      xl:basis-1/4
                    `}
                    key={index}
                  >
                    <Card
                      className={`
                        relative aspect-[4/3] min-h-[260px] p-0 transition-all
                        duration-300
                        hover:z-10 hover:scale-105
                      `}
                    >
                      <CardContent className="h-full p-0">
                        <div
                          className={`
                            grid h-full grid-cols-2 gap-0 overflow-hidden
                            rounded-xl
                          `}
                        >
                          <div className="relative h-full w-full">
                            <div
                              className={`
                                absolute top-2 left-2 z-10 rounded bg-black/70
                                px-2 py-1 text-xs font-semibold text-white
                              `}
                            >
                              {t("before")}
                            </div>
                            <Image
                              alt={`${item.alt} Before`}
                              className="object-cover"
                              fill
                              src={item.before}
                            />
                          </div>
                          <div className="relative h-full w-full">
                            <div
                              className={`
                                absolute top-2 left-2 z-10 rounded bg-black/70
                                px-2 py-1 text-xs font-semibold text-white
                              `}
                            >
                              {t("after")}
                            </div>
                            <Image
                              alt={`${item.alt} After`}
                              className="object-cover"
                              fill
                              src={item.after}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div
                className={`
                  hidden
                  sm:block
                `}
              >
                <CarouselPrevious
                  className={`
                    left-2 bg-white/80
                    hover:bg-white
                    lg:left-6
                  `}
                />
                <CarouselNext
                  className={`
                    right-2 bg-white/80
                    hover:bg-white
                    lg:right-6
                  `}
                />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
