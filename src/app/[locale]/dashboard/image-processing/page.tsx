import { Starfield } from "~/ui/components/starfield";

import { ImageProcessingPageClient } from "./page.client";

export default async function ImageProcessingPage() {

  return (
    <div className="min-h-screen">
      {/* <div className={`
        absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50
        dark:from-black dark:via-gray-950 dark:to-black
      `} /> */}

      {/* 星空装饰 */}
      <Starfield />
      <ImageProcessingPageClient />
    </div>
  );
  // return <ImageProcessingPageClient />;
}
