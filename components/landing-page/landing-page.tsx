import { Navbar } from "@/components/landing-page/navbar";
import { HeroSection } from "@/components/landing-page/hero-section";
import { PartnersSection } from "@/components/landing-page/partners-section";
import { HowItWorksSection } from "@/components/landing-page/how-it-works-section";
import { FeaturesSection } from "@/components/landing-page/features-section";
import { TemplateSection } from "@/components/landing-page/template-section";
import { PricingSection } from "@/components/landing-page/pricing-section";
import { TestimonialSection } from "@/components/landing-page/testimonial-section";
import { FaqSection } from "@/components/landing-page/faq-section";
import { CtaSection } from "@/components/landing-page/cta-section";
import { Footer } from "@/components/landing-page/footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export function LandingPage() {
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
