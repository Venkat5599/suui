import { Navigation6 } from "@/components/navigation-6";
import { Hero3 } from "@/components/hero-3";
import { Features1 } from "@/components/features-1";
import Contact2 from "@/components/contact-2";
import Footer8 from "@/components/footer-8";

/**
 * Tenki 天機 landing — composed from React Bits Pro blocks:
 * navigation-6, hero-3, features-1, contact-2, footer-8.
 */
export function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <Navigation6 />
      <Hero3 />
      <Features1 />
      <Contact2 />
      <Footer8 />
    </div>
  );
}

export default Landing;
