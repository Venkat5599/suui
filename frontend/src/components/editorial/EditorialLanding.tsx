import { useEffect, useState } from "react";
import { useLenis } from "@/lib/useLenis";
import { EditorialNav } from "./EditorialNav";
import { EditorialHero } from "./EditorialHero";
import { ChapterStack } from "./ChapterStack";
import { HorizontalShowcase } from "./HorizontalShowcase";
import { NetworkSection } from "./SignalGraph";
import { Preloader } from "./Preloader";
import { ScrollProgress, BlendCursor } from "./AwwwardsMotion";
import {
  Marquee,
  StatStrip,
  VerifyBlock,
  ClosingCTA,
  CreditsFooter,
} from "./EditorialSections";

/**
 * Tenki landing — Awwwards-style editorial redesign.
 *
 * Intro: a counter preloader (0→100, rotating multilingual wordmark) lifts a
 * curtain to reveal the hero, whose masked headline animation is gated until
 * the curtain clears. Signature scroll: ChapterStack renders sticky, full-height
 * panels that stack — each new chapter slides up over the previous, which
 * shrinks and blurs out behind it. Lenis drives smooth scroll; a blend-mode
 * magnetic cursor, scroll-progress bar, velocity-reactive marquee, magnetic
 * CTAs, and count-up stats round out the motion. All transforms are GPU-only.
 */
export function EditorialLanding() {
  const [ready, setReady] = useState(false);
  useLenis(ready);

  // Force dark editorial palette for this route regardless of the app theme,
  // and restore the previous state on unmount so dashboard routes are untouched.
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.add("dark");
    return () => {
      if (!hadDark) root.classList.remove("dark");
    };
  }, []);

  // Lock scroll during the intro; release the moment the curtain clears.
  useEffect(() => {
    document.body.style.overflow = ready ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ready]);

  return (
    <main className="editorial-grain relative min-h-screen bg-[#0a0f12] text-[#f5f5f0] antialiased md:cursor-none">
      <Preloader onDone={() => setReady(true)} />
      <ScrollProgress />
      <BlendCursor />
      <EditorialNav />
      <EditorialHero ready={ready} />
      <Marquee />
      <ChapterStack />
      <HorizontalShowcase />
      <NetworkSection />
      <StatStrip />
      <VerifyBlock />
      <ClosingCTA />
      <CreditsFooter />
    </main>
  );
}

export default EditorialLanding;
