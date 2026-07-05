import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Mail,
  Presentation,
  Send,
  X,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { aiApi } from "@/services/ai";
import { reportApi } from "@/services/report";
import type { AIReport, AIReportType } from "@/types/ai";

// ── helpers ────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<AIReportType, { label: string; color: string }> = {
  daily:   { label: "DPR",     color: "bg-blue-100 text-blue-700" },
  weekly:  { label: "WPR",     color: "bg-purple-100 text-purple-700" },
  monthly: { label: "MPR",     color: "bg-amber-100 text-amber-700" },
};

function fmt(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Quick-Download card ────────────────────────────────────────────────────

function DownloadCard({
  icon, title, desc, buttonLabel, onDownload,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  buttonLabel: string;
  onDownload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    setBusy(true);
    setDone(false);
    try {
      await onDownload();
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4">{desc}</p>
      <button
        onClick={handle}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
      >
        {busy ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
        ) : done ? (
          <><CheckCircle2 className="w-4 h-4" /> Downloaded!</>
        ) : (
          <><Download className="w-4 h-4" /> {buttonLabel}</>
        )}
      </button>
    </div>
  );
}

// ── Email inline form ──────────────────────────────────────────────────────

function EmailForm({
  reportId,
  onClose,
}: {
  reportId: string;
  onClose: () => void;
}) {
  const [email, setEmail]   = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const send = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    try {
      await reportApi.emailAiReport(reportId, email.trim());
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail ?? "Failed to send. Check SMTP settings.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
      {success ? (
        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Report sent successfully!
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@email.com"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              onKeyDown={(e) => e.key === "Enter" && send()}
              autoFocus
            />
            <button
              onClick={send}
              disabled={!email.trim() || sending}
              className="flex items-center gap-1 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        </>
      )}
    </div>
  );
}

// ── AI Report row ──────────────────────────────────────────────────────────

function ReportRow({ report }: { report: AIReport }) {
  const [downloading, setDownloading] = useState(false);
  const [showEmail, setShowEmail]     = useState(false);
  const badge = TYPE_BADGE[report.report_type] ?? { label: report.report_type, color: "bg-slate-100 text-slate-600" };

  const download = async () => {
    setDownloading(true);
    try {
      await reportApi.downloadAiReportPdf(report.id, report.title);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="border-b border-slate-100 last:border-0 px-5 py-4">
      <div className="flex items-start gap-3">
        <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badge.color}`}>
              {badge.label}
            </span>
            <p className="text-sm font-medium text-slate-800 truncate">{report.title}</p>
          </div>
          <p className="text-xs text-slate-400">{fmt(report.created_at)}{report.tokens_used ? ` · ${report.tokens_used} tokens` : ""}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={download}
            disabled={downloading}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:text-brand-900 border border-brand-200 hover:border-brand-400 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {downloading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />}
            PDF
          </button>
          <button
            onClick={() => setShowEmail((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
              showEmail
                ? "bg-brand-700 text-white border-brand-700"
                : "text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-400"
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
        </div>
      </div>

      {showEmail && (
        <div className="ml-7">
          <EmailForm reportId={report.id} onClose={() => setShowEmail(false)} />
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiApi.listReports()
      .then(({ data }) => setReports(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Download project reports as PDF or PowerPoint, or email them directly.
        </p>
      </div>

      {/* Quick downloads */}
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
        Quick Downloads
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <DownloadCard
          icon={<FileText className="w-5 h-5 text-brand-600" />}
          title="Project Summary Report"
          desc="All projects in a formatted PDF — KPIs, status table, budget overview."
          buttonLabel="Download PDF"
          onDownload={reportApi.downloadProjectSummaryPdf}
        />
        <DownloadCard
          icon={<Presentation className="w-5 h-5 text-brand-600" />}
          title="Project Status Presentation"
          desc="4-slide PowerPoint deck — cover, KPIs, project table, closing."
          buttonLabel="Download PPTX"
          onDownload={reportApi.downloadProjectPptx}
        />
      </div>

      {/* AI Report Library */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          AI Report Library ({reports.length})
        </h2>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No AI reports yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Generate a DPR, WPR, or MPR from the AI Features page.
            </p>
          </div>
        ) : (
          <div>
            {reports.map((r) => (
              <ReportRow key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
