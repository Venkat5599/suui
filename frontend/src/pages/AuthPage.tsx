import { SignIn, SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

/**
 * Tenki auth page — monochrome, synced with the landing aesthetic.
 * Clerk's widget is themed via the `appearance` prop to match (black accent,
 * rounded card, soft shadow, no purple).
 */

const clerkAppearance = {
  variables: {
    colorPrimary: "#171717",
    colorText: "#171717",
    colorTextSecondary: "#737373",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#171717",
    borderRadius: "0.875rem",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "mx-auto flex w-full justify-center",
    cardBox: "mx-auto",
    card: "shadow-xl border border-black/5 rounded-3xl bg-white",
    headerTitle: "text-neutral-900 font-semibold tracking-tight",
    headerSubtitle: "text-neutral-500",
    socialButtonsBlockButton:
      "border border-black/10 rounded-xl hover:bg-neutral-50 transition-colors",
    dividerLine: "bg-neutral-200",
    dividerText: "text-neutral-400",
    formFieldLabel: "text-neutral-700 font-medium",
    formFieldInput:
      "border border-black/10 rounded-xl focus:border-neutral-900 focus:ring-0",
    formButtonPrimary:
      "bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-medium normal-case shadow-sm",
    footerActionLink: "text-neutral-900 font-semibold hover:text-neutral-700",
    badge: "bg-neutral-100 text-neutral-600",
  },
} as const;

export function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      {/* Monochrome wash matching the landing hero */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.06) 40%, rgba(255,255,255,0) 75%), #ffffff",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <Link to="/" className="mb-8 flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-900 text-base font-bold text-white shadow-sm">T</span>
          Tenki
        </Link>
        <div className="flex w-full justify-center">
          {mode === "sign-in" ? (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
              appearance={clerkAppearance}
            />
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/dashboard"
              appearance={clerkAppearance}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
