import { SignIn, SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

/** Centered Clerk auth page (sign-in or sign-up), Tenki-branded. */
export function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-900">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, rgba(99,102,241,0.45) 0%, rgba(124,58,237,0.25) 40%, rgba(255,255,255,0) 75%), #ffffff",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <Link to="/" className="mb-8 flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-base font-bold text-white shadow-sm">天</span>
          Tenki <span className="font-normal text-gray-400">天機</span>
        </Link>
        {mode === "sign-in" ? (
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
        ) : (
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
        )}
      </div>
    </div>
  );
}

export default AuthPage;
