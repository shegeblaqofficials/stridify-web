import { Navbar } from "@/components/homepage/navbar";
import { Footer } from "@/components/homepage/footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const lastUpdated = "March 14, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using the Stridify platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use of the platform immediately.",
      "We may update these terms from time to time. Continued use of Stridify after changes are posted constitutes your acceptance of the revised terms.",
    ],
  },
  {
    title: "2. Account Registration",
    content: [
      "To use certain features of Stridify, you must create an account using Google OAuth or another supported authentication method. You are responsible for maintaining the security of your account credentials.",
      "You agree to provide accurate, current, and complete information during registration. You must notify us immediately of any unauthorized use of your account.",
      "You must be at least 13 years old to create an account. If you are under 18, you must have the consent of a parent or legal guardian.",
    ],
  },
  {
    title: "3. Use of the Platform",
    content: [
      "Stridify grants you a limited, non-exclusive, non-transferable, revocable license to access and use the platform in accordance with these terms.",
      "You may use Stridify to create, configure, deploy, and manage voice agents using our prompt-based builder and related tools. All agents you create remain associated with your account.",
      "You agree not to use the platform in any way that violates applicable laws, infringes on the rights of others, or disrupts the service for other users. Prohibited activities include reverse engineering, distributing malware, or attempting to gain unauthorized access to our systems.",
    ],
  },
  {
    title: "4. Intellectual Property",
    content: [
      "The Stridify platform, including its design, code, branding, and documentation, is owned by Stridify Inc. and protected by intellectual property laws. You may not copy, modify, or distribute any part of the platform without our written consent.",
      "You retain ownership of the content you create on Stridify, including voice agent configurations and prompts. By using the platform, you grant us a limited license to process and store your content as needed to deliver the service.",
    ],
  },
  {
    title: "5. Subscription & Billing",
    content: [
      "Some features of Stridify require a paid subscription. Pricing, billing cycles, and included features are described on our Pricing page and may change with reasonable notice.",
      "Payments are processed through our third-party payment provider. You agree to provide valid payment information and authorize recurring charges for your selected plan.",
      "You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. We do not offer prorated refunds for partial billing periods unless required by law.",
    ],
  },
  {
    title: "6. Service Availability",
    content: [
      "We strive to keep Stridify available and performant at all times. However, we do not guarantee uninterrupted service. Scheduled maintenance, updates, or unforeseen outages may temporarily affect availability.",
      "We reserve the right to modify, suspend, or discontinue any part of the platform at any time, with or without notice. We are not liable for any loss resulting from service interruptions.",
    ],
  },
  {
    title: "7. Limitation of Liability",
    content: [
      "To the maximum extent permitted by law, Stridify Inc. and its affiliates are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.",
      "Our total liability for any claim related to the service is limited to the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.",
    ],
  },
  {
    title: "8. Termination",
    content: [
      "We may suspend or terminate your account if we reasonably believe you have violated these terms, engaged in abusive behavior, or pose a risk to the platform or other users.",
      "Upon termination, your right to access the platform ceases immediately. We may retain certain data as required by law or for legitimate business purposes, such as fraud prevention.",
    ],
  },
  {
    title: "9. Governing Law",
    content: [
      "These terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.",
      "Any disputes arising from these terms or your use of Stridify will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, unless you qualify for small claims court.",
    ],
  },
  {
    title: "10. Contact Us",
    content: [
      "If you have any questions about these Terms of Service, please contact us at legal@stridify.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        {/* Header */}
        <div className="mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            Legal
          </p>
          <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Intro */}
        <p className="mb-12 text-base leading-relaxed text-muted-foreground">
          Welcome to Stridify. These terms govern your access to and use of our
          platform. Please read them carefully before using the service.
        </p>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-lg font-bold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.content.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[15px] leading-[1.8] text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
