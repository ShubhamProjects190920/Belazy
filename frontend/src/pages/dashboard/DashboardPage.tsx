import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  CheckCircle2,
  Clock,
  FolderKanban,
  IndianRupee,
  Loader2,
  Users,
  Zap,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { companyApi } from "@/services/company";
import { dashboardApi } from "@/services/dashboard";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/types/project";
import type { DashboardStats, RecentProject } from "@/types/dashboard";

const MODULES = [
  { name: "User Authentication",   module: 1, done: true  },
  { name: "Company & Roles",        module: 2, done: true  },
  { name: "Subscription & Billing", module: 3, done: true  },
  { name: "Project Management",     module: 4, done: true  },
  { name: "Excel System",           module: 5, done: true  },
  { name: "Dashboard & KPIs",       module: 6, done: true  },
  { name: "AI Features",            module: 7, done: true  },
  { name: "Reports",                module: 8, done: true  },
];

const STATUS_BAR_COLORS: Record<string, string> = {
  active:    "#10b981",
  planning:  "#4f7cff",
  on_hold:   "#f59e0b",
  completed: "#6b7280",
  canceled:  "#ef4444",
};

function formatBudget(val: number | null): string {
  if (val == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(val);
}

/* ── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({
  label, value, icon, color, glow,
}: {
  label:  string;
  value:  string | number;
  icon:   React.ReactNode;
  color:  string;
  glow:   string;
}) {
  return (
    <div
      className="rounded-2xl p-6 glass-card-hover flex flex-col gap-4 group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{ background: `${glow}`, color, boxShadow: `0 0 20px ${glow}` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
        <p className="text-sm text-[var(--text-2)] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── Recent Project Row ───────────────────────────────────────── */
function RecentProjectRow({ project }: { project: RecentProject }) {
  const status   = STATUS_CONFIG[project.status   as keyof typeof STATUS_CONFIG];
  const priority = PRIORITY_CONFIG[project.priority as keyof typeof PRIORITY_CONFIG];
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text)] truncate">{project.name}</p>
        {project.client_name && (
          <p className="text-xs text-[var(--text-3)] truncate">{project.client_name}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priority?.color}`}>
          {priority?.label}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status?.color}`}>
          {status?.label}
        </span>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export function DashboardPage() {
  const { user }             = useAuthStore();
  const { company, setCompany } = useCompanyStore();
  const [stats, setStats]    = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company && user?.company_id) {
      companyApi.getMyCompany().then(({ data }) => setCompany(data)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const doneCount  = MODULES.filter((m) => m.done).length;
  const planLabel  = stats?.plan
    ? stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)
    : "Starter";

  return (
    <AppLayout>
      {/* ── Welcome Banner ───────────────────────────────────────── */}
      <div
        className="rounded-2xl p-7 mb-8 relative overflow-hidden animate-fade-in-up"
        style={{
          background: "linear-gradient(135deg, rgba(79,124,255,0.15) 0%, rgba(139,92,246,0.12) 100%)",
          border: "1px solid rgba(79,124,255,0.2)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-widest mb-1">
              {company?.name ?? "Your Company"}
            </p>
            <h1 className="text-2xl font-extrabold text-[var(--text)] mb-1">
              Good day, {user?.first_name}! 👋
            </h1>
            <p className="text-sm text-[var(--text-2)]">
              {doneCount} of 8 modules live
              <span className="mx-2">·</span>
              Plan:{" "}
              <span
                className="font-semibold text-[var(--blue)]"
                style={{ textShadow: "0 0 10px rgba(79,124,255,0.5)" }}
              >
                {planLabel}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-green-400"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            All systems live
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 mb-8">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--blue)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Total Projects"
            value={stats?.total_projects ?? 0}
            icon={<FolderKanban className="w-5 h-5" />}
            color="#4f7cff"
            glow="rgba(79,124,255,0.15)"
          />
          <KpiCard
            label="Active Projects"
            value={stats?.active_projects ?? 0}
            icon={<Zap className="w-5 h-5" />}
            color="#10b981"
            glow="rgba(16,185,129,0.15)"
          />
          <KpiCard
            label="Team Members"
            value={stats?.team_members ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="#8b5cf6"
            glow="rgba(139,92,246,0.15)"
          />
          <KpiCard
            label="Total Budget"
            value={formatBudget(stats?.total_budget ?? null)}
            icon={<IndianRupee className="w-5 h-5" />}
            color="#f59e0b"
            glow="rgba(245,158,11,0.15)"
          />
        </div>
      )}

      {/* ── Status + Projects ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Project Status */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--blue)]" />
              <h2 className="text-sm font-bold text-[var(--text)]">Project Status</h2>
            </div>
            <Link to="/projects"
              className="text-xs text-[var(--blue)] hover:underline font-medium flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {!stats || stats.total_projects === 0 ? (
            <p className="text-sm text-[var(--text-3)] text-center py-10">No projects yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.status_breakdown.filter((s) => s.count > 0).map((s) => (
                <div key={s.status}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-[var(--text-2)]">{s.label}</span>
                    <span className="text-[var(--text-3)]">{s.count} ({s.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${s.percentage}%`,
                        background: STATUS_BAR_COLORS[s.status] ?? "#6b7280",
                        boxShadow: `0 0 8px ${STATUS_BAR_COLORS[s.status] ?? "#6b7280"}80`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[var(--purple)]" />
              <h2 className="text-sm font-bold text-[var(--text)]">Recent Projects</h2>
            </div>
            <Link to="/projects"
              className="text-xs text-[var(--blue)] hover:underline font-medium flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {!stats || stats.recent_projects.length === 0 ? (
            <p className="text-sm text-[var(--text-3)] text-center py-10">No projects yet.</p>
          ) : (
            <div>
              {stats.recent_projects.map((p) => (
                <RecentProjectRow key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Module Progress ───────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--text)]">
          Build Progress
          <span className="ml-2 text-[var(--blue)]">{doneCount}/8 complete</span>
        </h2>
        <div className="text-xs text-[var(--text-3)]">
          {Math.round((doneCount / 8) * 100)}% done
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {MODULES.map((m) => (
          <div
            key={m.module}
            className="rounded-xl p-4 flex items-start gap-3 transition-all duration-200"
            style={m.done ? {
              background: "rgba(16,185,129,0.07)",
              border: "1px solid rgba(16,185,129,0.2)",
            } : {
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {m.done
              ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              : <Clock        className="w-4 h-4 text-[var(--text-3)] shrink-0 mt-0.5" />}
            <div>
              <p className={`text-xs font-bold mb-0.5 ${m.done ? "text-green-500" : "text-[var(--text-3)]"}`}>
                Module {m.module}
              </p>
              <p className={`text-xs font-medium ${m.done ? "text-[var(--text)]" : "text-[var(--text-2)]"}`}>
                {m.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI Teaser ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4 animate-border-glow transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
        style={{
          background: "rgba(139,92,246,0.07)",
          border: "1px solid rgba(139,92,246,0.2)",
        }}
        onClick={() => window.location.href = "/ai"}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(139,92,246,0.15)", color: "var(--purple)",
            boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
        >
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--text)]">AI Assistant is live</p>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Generate DPR/WPR/MPR reports and chat with your AI project manager.
          </p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[var(--text-3)] shrink-0" />
      </div>
    </AppLayout>
  );
}
