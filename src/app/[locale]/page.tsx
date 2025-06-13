import { AIColorizationGallery } from "~/ui/components/home/ai-colorization-gallery";
import { ExperienceDifferenceSection } from "~/ui/components/home/experience-difference-section";
import { FinalCTASection } from "~/ui/components/home/final-cta-section";
import { HeroSection } from "~/ui/components/home/hero-section";
import { HomeTestimonialsSection } from "~/ui/components/home/testimonials-section";
import { TrustedSection } from "~/ui/components/home/trusted-section";


export default function HomePage() {
  return (
    <>
      <main
        className={`
          flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50
          via-muted/25 to-background
        `}
      >
        {/* Hero Section */}
        <HeroSection />

        <TrustedSection />

        <ExperienceDifferenceSection />

        {/* Home Testimonials Section */}
        <HomeTestimonialsSection />

        {/* AI Colorization Gallery */}
        <AIColorizationGallery />

        {/* Final CTA Section */}
        <FinalCTASection />
      </main>
    </>
  );
}
