import { Navbar } from "@/components/homepage/navbar";
import { HeroSection } from "@/components/homepage/hero-section";
import { PartnersSection } from "@/components/homepage/partners-section";
import { HowItWorksSection } from "@/components/homepage/how-it-works-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { TemplateSection } from "@/components/homepage/template-section";
import { PricingSection } from "@/components/homepage/pricing-section";
import { TestimonialSection } from "@/components/homepage/testimonial-section";
import { FaqSection } from "@/components/homepage/faq-section";
import { CtaSection } from "@/components/homepage/cta-section";
import { Footer } from "@/components/homepage/footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export default function Home() {
  return (
    <>
      {/* Noise texture overlay */}
      <div className="noise-overlay" />
      <Navbar />
      <main className="relative pb-20 pt-0">
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TemplateSection />
        <TestimonialSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
