import { Zap } from "lucide-react";

interface AuthLayoutProps {
  children:  React.ReactNode;
  title:     string;
  subtitle?: string;
}

const FEATURES = [
  "AI-powered DPR / WPR / MPR generation",
  "Real-time S-Curve & milestone tracking",
  "Delay analysis & recovery plans",
  "One-click PDF, Excel & PowerPoint reports",
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden">
        {/* Animated orbs */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none animate-orb-1"
          style={{ background: "radial-gradient(circle, rgba(79,124,255,0.12) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 right-10 w-[400px] h-[400px] rounded-full pointer-events-none animate-orb-2"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)" }}
        />
        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600 shadow-[0_0_24px_rgba(79,124,255,0.5)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[var(--text)] tracking-tight">Belazy</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold leading-snug mb-3 text-[var(--text)]">
            Work Smart.<br />
            <span className="gradient-text">Automate Everything.</span>
          </h2>
          <p className="text-[var(--text-2)] text-base leading-relaxed mb-10">
            The AI-powered platform built for modern construction companies. Control every project, predict every outcome.
          </p>

          <div className="space-y-3.5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-brand-500 to-violet-600">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[var(--text-2)] text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[var(--text-3)] text-xs">
          © 2024 Belazy. Work Smart. Automate Everything.
        </p>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-[var(--text)] font-bold text-lg tracking-tight">Belazy</span>
        </div>

        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(13,13,32,0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[var(--text)]">{title}</h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-[var(--text-2)]">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
