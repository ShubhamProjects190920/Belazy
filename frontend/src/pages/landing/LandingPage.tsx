import { Link } from "react-router-dom";
import {
  Zap,
  BrainCircuit,
  FolderKanban,
  FileBarChart2,
  Users,
  ChevronRight,
  Check,
  Building2,
  TrendingUp,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

/* ── Section: Nav ─────────────────────────────────────────────── */
function Nav() {
  const { theme, toggle } = useTheme();
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{
        background: "rgba(7,7,26,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600 shadow-[0_0_16px_rgba(79,124,255,0.5)]">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg text-[var(--text)] tracking-tight">Belazy</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {["Features", "Pricing", "FAQ"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <Link
          to="/auth"
          className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
        >
          Sign in
        </Link>
        <Link
          to="/auth"
          className="btn-primary text-xs px-4 py-2.5 rounded-lg"
          style={{
            background: "linear-gradient(135deg,#4f7cff 0%,#7c3aed 100%)",
            boxShadow: "0 4px 16px rgba(79,124,255,0.35)",
          }}
        >
          Get Started <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </nav>
  );
}

/* ── Section: Hero ────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none animate-orb-1"
        style={{ background: "radial-gradient(circle, rgba(79,124,255,0.15) 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none animate-orb-2"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none animate-orb-3"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)" }}
      />

      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-brand-400 mb-8"
          style={{ background: "rgba(79,124,255,0.1)", border: "1px solid rgba(79,124,255,0.25)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          AI-Powered Construction Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--text)] leading-none tracking-tight mb-6">
          Work Smart.{" "}
          <span className="gradient-text block md:inline">Automate Everything.</span>
        </h1>

        <p className="text-xl text-[var(--text-2)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Belazy gives construction companies AI-powered project controls, automated reporting, and real-time insights — all in one beautiful platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 font-semibold text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 text-base"
            style={{
              background: "linear-gradient(135deg, #4f7cff 0%, #7c3aed 100%)",
              boxShadow: "0 8px 32px rgba(79,124,255,0.45), 0 0 60px rgba(139,92,246,0.15)",
            }}
          >
            Start for Free
            <ChevronRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 font-medium text-[var(--text-2)] hover:text-[var(--text)] px-8 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            See Features
          </a>
        </div>

        {/* Trust row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-[var(--text-3)] text-sm">
          {["No credit card required", "Cancel anytime", "SOC 2 compliant"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-green-500" />
              {t}
            </span>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="mt-16 relative max-w-4xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(13,13,32,0.9)",
              border: "1px solid var(--border)",
              boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(79,124,255,0.1)",
            }}
          >
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-4 h-6 rounded-md text-xs flex items-center px-3 text-[var(--text-3)]"
                style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
                app.belazy.io/dashboard
              </div>
            </div>
            {/* Dashboard mock */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-5">
                {[
                  { label: "Total Projects", value: "24", color: "#4f7cff" },
                  { label: "Active",         value: "11", color: "#10b981" },
                  { label: "Team Members",   value: "38", color: "#8b5cf6" },
                  { label: "Budget",         value: "₹4.2Cr", color: "#f59e0b" },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl p-4"
                    style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: card.color }}>
                      {card.value}
                    </div>
                    <div className="text-xs text-[var(--text-3)]">{card.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold text-[var(--text-2)] mb-3">Project Status</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Active",    pct: 58, color: "#10b981" },
                      { label: "Planning",  pct: 25, color: "#4f7cff" },
                      { label: "On Hold",   pct: 17, color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs text-[var(--text-3)] mb-1">
                          <span>{s.label}</span><span>{s.pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold text-[var(--text-2)] mb-3">Recent Projects</p>
                  <div className="space-y-2.5">
                    {[
                      { name: "Metro Rail Phase 3", status: "Active" },
                      { name: "Highway Bypass",    status: "Planning" },
                      { name: "Dam Renovation",    status: "On Hold" },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-2)] truncate">{p.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 ml-2"
                          style={{ background: "rgba(79,124,255,0.12)", color: "#4f7cff" }}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow below preview */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-3/4 h-32 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(79,124,255,0.25) 0%, transparent 70%)", filter: "blur(20px)" }} />
        </div>
      </div>
    </section>
  );
}

/* ── Section: Features ────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    color: "#4f7cff",
    glow: "rgba(79,124,255,0.2)",
    title: "AI-Generated Reports",
    desc: "Generate Daily, Weekly, and Monthly Progress Reports in seconds using Claude AI. Export to PDF or PowerPoint with one click.",
  },
  {
    icon: <FolderKanban className="w-6 h-6" />,
    color: "#10b981",
    glow: "rgba(16,185,129,0.2)",
    title: "Project Management",
    desc: "Track every project with real-time status, priority levels, budget monitoring, and milestone tracking — all in one view.",
  },
  {
    icon: <FileBarChart2 className="w-6 h-6" />,
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.2)",
    title: "Excel Integration",
    desc: "Import and export project data from Excel. Manage tasks, quantities, and schedules with familiar spreadsheet power.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.2)",
    title: "KPI Dashboard",
    desc: "Real-time dashboard showing project health, budget utilization, team performance, and predictive analytics.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
    title: "Team Management",
    desc: "Invite team members, assign roles, and control permissions. Full audit trail for every action taken.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    color: "#ef4444",
    glow: "rgba(239,68,68,0.2)",
    title: "Enterprise Security",
    desc: "Role-based access control, JWT authentication, encrypted data, and compliance-ready audit logs.",
  },
];

function Features() {
  return (
    <section id="features" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-violet-400 mb-4"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <Zap className="w-3 h-3" />
            Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text)] mb-4">
            Built for construction,<br />
            <span className="gradient-text">powered by AI</span>
          </h2>
          <p className="text-[var(--text-2)] max-w-xl mx-auto">
            Every tool your team needs to deliver projects on time, on budget, and with full visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card-hover p-6 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ background: `rgba(${f.glow})`, color: f.color,
                  boxShadow: `0 0 20px ${f.glow}` }}
              >
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-[var(--text)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: Pricing ─────────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For small teams getting started",
    features: ["5 projects", "3 team members", "Basic reports", "Email support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹4,999",
    period: "/month",
    desc: "For growing construction companies",
    features: [
      "Unlimited projects",
      "25 team members",
      "AI-powered reports",
      "PDF & PowerPoint export",
      "Priority support",
      "Excel integration",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large organizations",
    features: [
      "Unlimited everything",
      "Custom AI models",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
      "On-premise option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text)] mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[var(--text-2)]">No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1"
              style={plan.highlighted ? {
                background: "rgba(79,124,255,0.08)",
                border: "1px solid rgba(79,124,255,0.35)",
                boxShadow: "0 0 40px rgba(79,124,255,0.15)",
              } : {
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {plan.highlighted && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white mb-4 w-fit"
                  style={{ background: "linear-gradient(135deg,#4f7cff,#7c3aed)" }}>
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-[var(--text)] mb-1">{plan.name}</h3>
              <p className="text-sm text-[var(--text-2)] mb-5">{plan.desc}</p>
              <div className="flex items-end gap-1 mb-7">
                <span className="text-4xl font-extrabold text-[var(--text)]">{plan.price}</span>
                <span className="text-[var(--text-3)] pb-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-2)]">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={[
                  "w-full text-center font-semibold py-3 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5",
                  plan.highlighted
                    ? "text-white"
                    : "text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-h)]",
                ].join(" ")}
                style={plan.highlighted ? {
                  background: "linear-gradient(135deg,#4f7cff 0%,#7c3aed 100%)",
                  boxShadow: "0 4px 20px rgba(79,124,255,0.35)",
                } : {
                  background: "var(--elevated)",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: FAQ ─────────────────────────────────────────────── */
const FAQS = [
  {
    q: "What is Belazy?",
    a: "Belazy is an AI-powered project controls platform built specifically for construction companies. It combines project management, AI report generation, Excel integration, and real-time dashboards in one platform.",
  },
  {
    q: "How does the AI report generation work?",
    a: "Belazy uses Claude AI (Anthropic) to analyze your project data and generate comprehensive Daily, Weekly, and Monthly Progress Reports. You can export them to PDF, PowerPoint, or send them via email.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. We use role-based access controls, JWT authentication, and maintain full audit logs.",
  },
  {
    q: "Can I import my existing Excel data?",
    a: "Yes. Belazy has a built-in Excel import/export system. You can bring in project data, task schedules, and quantities directly from your spreadsheets.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. The Starter plan is completely free with no credit card required. You can upgrade to Professional when your team grows.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-[var(--text)] mb-3">
            Frequently asked questions
          </h2>
          <p className="text-[var(--text-2)]">Everything you need to know about Belazy.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl px-6 py-5 transition-all duration-200"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <summary className="flex items-center justify-between cursor-pointer list-none text-[var(--text)] font-semibold text-sm select-none">
                {faq.q}
                <ChevronRight className="w-4 h-4 text-[var(--text-3)] transition-transform duration-200 group-open:rotate-90 shrink-0 ml-4" />
              </summary>
              <p className="mt-3 text-sm text-[var(--text-2)] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: CTA ─────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="rounded-3xl px-10 py-16 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(79,124,255,0.12) 0%, rgba(139,92,246,0.12) 100%)",
            border: "1px solid rgba(79,124,255,0.25)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(79,124,255,0.08) 0%, transparent 70%)" }}
          />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-brand-500 to-violet-600"
              style={{ boxShadow: "0 0 40px rgba(79,124,255,0.5)" }}>
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-[var(--text)] mb-4">
              Ready to automate?
            </h2>
            <p className="text-[var(--text-2)] mb-8 text-lg">
              Join hundreds of construction companies already using Belazy to work smarter.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 font-semibold text-white px-10 py-4 rounded-2xl text-base transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, #4f7cff 0%, #7c3aed 100%)",
                boxShadow: "0 8px 32px rgba(79,124,255,0.5)",
              }}
            >
              Start Free Today
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Section: Footer ──────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="px-8 py-8 text-center"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-[var(--text)]">Belazy</span>
      </div>
      <p className="text-xs text-[var(--text-3)]">
        © 2024 Belazy. Work Smart. Automate Everything.
      </p>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div style={{ background: "var(--bg)" }}>
      <Nav />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
