"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Card } from "~/ui/primitives/card";
// 效果展示图片
const effectImages = [
  "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/effect-1.png",
  "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/effect-2.png",
  "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/effect-3.png",
  "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/effect-4.png",
  "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/effect-5.png",
  "https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/effect-6.png",
];

export function AIColorizationGallery() {
  const t = useTranslations("Home");

  return (
    <section className="py-20">
      <div className="mx-auto px-4">
        <div className="space-y-12 text-center">
          <div className="space-y-4">
            <h2
              className={`
                text-3xl font-bold text-foreground
                lg:text-4xl
              `}
            >
              {t("newGenerationAI")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t("yearsOfResearch")}
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="mx-auto max-w-6xl">
            <div
              className={`
                grid grid-cols-1 gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              `}
            >
              {effectImages.map((image, index) => (
                <Card
                  className={`
                    cursor-pointer overflow-hidden transition-all duration-300
                    hover:shadow-xl
                  `}
                  key={index}
                >
                  <Image
                    alt={`Effect ${index + 1}`}
                    className={`
                      h-auto w-full object-cover transition-transform
                      duration-300
                      hover:scale-105
                    `}
                    height={250}
                    src={image}
                    width={200}
                  />
                  {/* <CardContent className="p-0">
                    <Image
                      alt={`Effect ${index + 1}`}
                      className={`
                        h-auto w-full object-cover transition-transform
                        duration-300
                        hover:scale-105
                      `}
                      height={250}
                      src={image}
                      width={200}
                    />
                  </CardBody> */}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
