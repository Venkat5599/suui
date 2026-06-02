import { Navigation6 } from "@/components/navigation-6";
import { Hero3 } from "@/components/hero-3";
import { Features1 } from "@/components/features-1";
import { HowItWorks, Chains, Pricing } from "@/components/landing-sections";
import Contact2 from "@/components/contact-2";
import Footer8 from "@/components/footer-8";

/**
 * Tenki 天機 landing — React Bits Pro blocks (navigation-6, hero-3, features-1,
 * contact-2, footer-8) plus custom Tenki sections (how it works, chains, pricing).
 */
export function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <Navigation6 />
      <Hero3 />
      <Features1 />
      <HowItWorks />
      <Chains />
      <Pricing />
      <Contact2 />
      <Footer8 />
    </div>
  );
}

export default Landing;
