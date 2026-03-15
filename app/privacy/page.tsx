import { Navbar } from "@/components/homepage/navbar";
import { Footer } from "@/components/homepage/footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const lastUpdated = "March 14, 2026";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "We collect information you provide directly, such as your name, email address, and account credentials when you create an account or sign in with Google OAuth.",
      "We automatically collect certain technical data when you use our platform, including your IP address, browser type, device information, and usage patterns. This helps us maintain and improve the service.",
      "When you build or interact with voice agents on Stridify, we may process voice data and conversation logs to deliver the service. We do not sell or share raw voice data with third parties.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "We use your information to provide, maintain, and improve the Stridify platform, including creating and managing your account, processing your voice agent configurations, and delivering the features you request.",
      "We may use aggregated, anonymized data to analyze usage trends, monitor platform performance, and develop new features. This data cannot be used to identify you personally.",
      "We may send you service-related communications such as account verification, security alerts, and product updates. You can opt out of non-essential communications at any time.",
    ],
  },
  {
    title: "3. Data Sharing & Third Parties",
    content: [
      "We work with trusted third-party services to power parts of our platform, including Supabase for authentication and database services, and AI model providers for voice and language processing. These providers only access your data as needed to perform their services.",
      "We will never sell your personal information. We may share data if required by law, to protect our rights, or to prevent fraud or security threats.",
      "If Stridify is involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction. We will notify you of any such change.",
    ],
  },
  {
    title: "4. Data Security",
    content: [
      "We implement industry-standard security measures including encryption in transit (TLS) and at rest, secure authentication flows, and regular security audits to protect your data.",
      "While we take every reasonable precaution, no system is completely secure. We encourage you to use strong passwords and enable any available security features on your account.",
    ],
  },
  {
    title: "5. Your Rights & Choices",
    content: [
      "You can access, update, or delete your account information at any time through your account settings. If you wish to delete your account entirely, contact us and we will process your request promptly.",
      "Depending on your jurisdiction, you may have additional rights under data protection laws such as GDPR or CCPA, including the right to data portability, the right to restrict processing, and the right to object to certain uses of your data.",
    ],
  },
  {
    title: "6. Cookies & Tracking",
    content: [
      "We use essential cookies to keep you signed in and remember your preferences (such as your theme setting). We do not use third-party advertising cookies.",
      "You can manage cookie preferences through your browser settings. Disabling essential cookies may affect the functionality of the platform.",
    ],
  },
  {
    title: "7. Children's Privacy",
    content: [
      "Stridify is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us so we can remove it.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. When we make material changes, we will notify you by updating the date at the top of this page and, where appropriate, through an in-app notification or email.",
    ],
  },
  {
    title: "9. Contact Us",
    content: [
      "If you have questions or concerns about this Privacy Policy or our data practices, please reach out to us at privacy@stridify.com.",
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Intro */}
        <p className="mb-12 text-base leading-relaxed text-muted-foreground">
          At Stridify, your privacy matters. This policy explains what
          information we collect, how we use it, and the choices you have. We
          believe in transparency and keeping things simple.
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
