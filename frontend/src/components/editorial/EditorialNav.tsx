import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const LINKS = [
  { label: "Describe", href: "#ch-01", n: "01" },
  { label: "Decide", href: "#ch-02", n: "02" },
  { label: "Anchor", href: "#ch-03", n: "03" },
  { label: "Verify", href: "#verify", n: "04" },
  { label: "Autonomous", href: "#ch-05", n: "05" },
];

const EASE = [0.32, 0.72, 0, 1] as const;

export function EditorialNav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4">
        <div
          className={[
            "pointer-events-auto mt-5 flex w-full max-w-[1180px] items-center justify-between rounded-full px-3 py-2.5 pl-6 transition-all duration-700",
            "ease-[cubic-bezier(0.32,0.72,0,1)]",
            solid || open
              ? "border border-white/10 bg-[#0a0f12]/70 backdrop-blur-xl"
              : "border border-transparent bg-transparent",
          ].join(" ")}
        >
          <a
            href="#top"
            className="font-display text-[15px] font-semibold tracking-tight text-[#f5f5f0]"
          >
            tenki<span className="text-cyan-300">.</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative font-editorial text-[13px] font-medium tracking-wide text-[#f5f5f0]/70 transition-colors hover:text-[#f5f5f0]"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan-300 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="group hidden items-center gap-2 rounded-full bg-[#f5f5f0] py-2.5 pl-5 pr-2.5 text-[13px] font-semibold text-[#0a0f12] transition-transform duration-200 active:scale-[0.97] sm:inline-flex"
            >
              Launch app
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
            </a>

            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 md:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className="absolute left-0 block h-px w-4 bg-[#f5f5f0] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ top: open ? "6px" : "0", transform: open ? "rotate(45deg)" : "none" }}
                />
                <span
                  className="absolute left-0 top-[6px] block h-px w-4 bg-[#f5f5f0] transition-all duration-200"
                  style={{ opacity: open ? 0 : 1 }}
                />
                <span
                  className="absolute left-0 block h-px w-4 bg-[#f5f5f0] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ top: open ? "6px" : "12px", transform: open ? "rotate(-45deg)" : "none" }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-[65] flex flex-col justify-end bg-[#0a0f12]/90 px-6 pb-16 backdrop-blur-3xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.06 * i }}
                  className="flex items-baseline gap-4 border-b border-white/10 py-4"
                >
                  <span className="font-mono text-xs text-cyan-300/70">{l.n}</span>
                  <span className="font-display text-4xl font-medium text-[#f5f5f0]">{l.label}</span>
                </motion.a>
              ))}
              <motion.a
                href="/dashboard"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.06 * LINKS.length }}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#f5f5f0] px-6 py-4 font-semibold text-[#0a0f12]"
              >
                Launch app <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
