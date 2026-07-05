import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { projectApi } from "@/services/project";
import { aiApi } from "@/services/ai";
import type { Project } from "@/types/project";
import type { AIReport, AIReportType, ChatMessage } from "@/types/ai";

// ── helpers ────────────────────────────────────────────────────────────────

const REPORT_TYPES: { value: AIReportType; label: string; desc: string }[] = [
  { value: "daily",   label: "DPR — Daily",   desc: "Daily site summary: work done, resources, blockers" },
  { value: "weekly",  label: "WPR — Weekly",  desc: "Week summary: milestones, budget, risk register" },
  { value: "monthly", label: "MPR — Monthly", desc: "Monthly executive report: financials, schedule, outlook" },
];

function fmt(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isAiNotConfigured(err: unknown): boolean {
  const e = err as { response?: { status?: number } };
  return e?.response?.status === 503;
}

// ── sub-components ─────────────────────────────────────────────────────────

function Tab({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-white text-brand-700 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function AiNotConfiguredBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800">AI not configured</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Add your <code className="bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code> to the{" "}
          <code className="bg-amber-100 px-1 rounded">.env</code> file, then rebuild the backend container.
          Get a key at <strong>console.anthropic.com</strong>.
        </p>
      </div>
    </div>
  );
}

// Minimal markdown renderer — handles the subset Claude uses in reports
function ReportContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="text-lg font-bold text-slate-900 mt-5 mb-2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="text-sm font-semibold text-slate-700 mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("| ")) {
      // table — collect all table lines
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const [header, , ...rows] = tableLines;
      const cols = header.split("|").filter(Boolean).map((c) => c.trim());
      nodes.push(
        <div key={i} className="overflow-x-auto my-2">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr>
                {cols.map((c, j) => (
                  <th key={j} className="text-left py-1.5 px-2 bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="even:bg-slate-50">
                  {row.split("|").filter(Boolean).map((cell, ci) => (
                    <td key={ci} className="py-1.5 px-2 border border-slate-200 text-slate-600">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={i} className="list-disc list-inside space-y-0.5 my-1 text-sm text-slate-700">
          {items.map((it, j) => <li key={j}>{inlineMd(it)}</li>)}
        </ul>
      );
      continue;
    } else if (line.trim() === "" || line === "---") {
      nodes.push(<div key={i} className="h-2" />);
    } else {
      nodes.push(
        <p key={i} className="text-sm text-slate-700 leading-relaxed">
          {inlineMd(line)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-0.5">{nodes}</div>;
}

// Converts **bold** and inline code `x` within a single line
function inlineMd(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-slate-100 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

// ── Report Generator tab ───────────────────────────────────────────────────

function ReportGeneratorTab() {
  const [projects, setProjects]           = useState<Project[]>([]);
  const [selectedProject, setSelected]   = useState("");
  const [reportType, setReportType]       = useState<AIReportType>("daily");
  const [extraCtx, setExtraCtx]           = useState("");
  const [generating, setGenerating]       = useState(false);
  const [genError, setGenError]           = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const [savedReports, setSaved]         = useState<AIReport[]>([]);
  const [activeReport, setActive]        = useState<AIReport | null>(null);
  const [deleting, setDeleting]          = useState<string | null>(null);

  useEffect(() => {
    projectApi.list().then(({ data }) => setProjects(data)).catch(() => {});
    aiApi.listReports().then(({ data }) => setSaved(data)).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedProject) return;
    setGenerating(true);
    setGenError(null);
    setNotConfigured(false);
    setActive(null);
    try {
      const { data } = await aiApi.generateReport({
        project_id: selectedProject,
        report_type: reportType,
        extra_context: extraCtx || undefined,
      });
      setActive(data);
      setSaved((prev) => [data, ...prev]);
      setExtraCtx("");
    } catch (err: unknown) {
      if (isAiNotConfigured(err)) {
        setNotConfigured(true);
      } else {
        const e = err as { response?: { data?: { detail?: string } } };
        setGenError(e?.response?.data?.detail ?? "Report generation failed. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await aiApi.deleteReport(id);
      setSaved((prev) => prev.filter((r) => r.id !== id));
      if (activeReport?.id === id) setActive(null);
    } finally {
      setDeleting(null);
    }
  };

  const rt = REPORT_TYPES.find((r) => r.value === reportType)!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-5">
        {notConfigured && <AiNotConfiguredBanner />}

        {/* Project selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Select Project <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">— Choose a project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {projects.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">No projects yet — create one in Projects first.</p>
          )}
        </div>

        {/* Report type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Report Type</label>
          <div className="space-y-2">
            {REPORT_TYPES.map((r) => (
              <label
                key={r.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  reportType === r.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value={r.value}
                  checked={reportType === r.value}
                  onChange={() => setReportType(r.value)}
                  className="mt-0.5 accent-brand-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Extra context */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Additional Context <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={extraCtx}
            onChange={(e) => setExtraCtx(e.target.value)}
            rows={3}
            placeholder="e.g. RCC work started on Block A, 45 workers on site, crane breakdowns in the morning..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {genError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {genError}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!selectedProject || generating}
          className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating {rt.label}…</>
          ) : (
            <><BrainCircuit className="w-4 h-4" /> Generate {rt.label}</>
          )}
        </button>
      </div>

      {/* Right: Report output + history */}
      <div className="lg:col-span-3 space-y-5">
        {/* Active report */}
        {generating && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-sm">AI is writing your {rt.label}…</p>
          </div>
        )}

        {activeReport && !generating && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-semibold text-slate-800 truncate">{activeReport.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeReport.tokens_used && (
                  <span className="text-xs text-slate-400">{activeReport.tokens_used} tokens</span>
                )}
                <button
                  onClick={() => handleDelete(activeReport.id)}
                  disabled={deleting === activeReport.id}
                  className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-5 max-h-[500px] overflow-y-auto">
              <ReportContent text={activeReport.content} />
            </div>
          </div>
        )}

        {/* Saved reports list */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Saved Reports ({savedReports.length})</p>
          </div>
          {savedReports.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No reports generated yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {savedReports.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                    activeReport?.id === r.id ? "bg-brand-50" : ""
                  }`}
                  onClick={() => setActive(r)}
                >
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.title}</p>
                    <p className="text-xs text-slate-400">{fmt(r.created_at)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                    disabled={deleting === r.id}
                    className="p-1 rounded text-slate-300 hover:text-red-400 transition-colors shrink-0"
                  >
                    {deleting === r.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Chat tab ───────────────────────────────────────────────────────────────

function ChatTab() {
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [input, setInput]                 = useState("");
  const [sending, setSending]             = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [chatError, setChatError]         = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setSending(true);
    setNotConfigured(false);
    setChatError(null);

    try {
      const { data } = await aiApi.chat(updated);
      setMessages([...updated, { role: "assistant", content: data.message }]);
    } catch (err: unknown) {
      if (isAiNotConfigured(err)) {
        setNotConfigured(true);
        setMessages((prev) => prev.slice(0, -1)); // remove the user msg
      } else {
        setChatError("Failed to get a response. Please try again.");
        setMessages([...updated, { role: "assistant", content: "⚠️ Failed to get a response. Please try again." }]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ height: "calc(100vh - 240px)", minHeight: "480px" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {notConfigured && <AiNotConfiguredBanner />}
        {chatError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{chatError}</div>
        )}

        {messages.length === 0 && !notConfigured && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <BrainCircuit className="w-12 h-12 mb-3 text-slate-200" />
            <p className="text-sm font-medium">AI Project Assistant</p>
            <p className="text-xs mt-1">Ask anything about project management, construction best practices, or your site data.</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "How do I track project delays?",
                "What is a critical path?",
                "Tips for reducing project cost overruns",
                "How to write a good DPR?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-brand-700 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {m.role === "assistant"
                ? <ReportContent text={m.content} />
                : m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span className="text-sm text-slate-500">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Ask about project management, construction best practices…  (Enter to send)"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex items-center justify-center w-10 h-10 bg-brand-700 hover:bg-brand-800 disabled:opacity-40 text-white rounded-xl transition-colors shrink-0 self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-center">
          AI can make mistakes. Always verify critical project decisions independently.
        </p>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export function AIPage() {
  const [tab, setTab] = useState<"generator" | "chat">("generator");

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Features</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate Daily, Weekly &amp; Monthly Progress Reports, or chat with your AI assistant.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
        <Tab
          active={tab === "generator"}
          onClick={() => setTab("generator")}
          icon={<FileText className="w-4 h-4" />}
          label="Report Generator"
        />
        <Tab
          active={tab === "chat"}
          onClick={() => setTab("chat")}
          icon={<MessageSquare className="w-4 h-4" />}
          label="Chat Assistant"
        />
      </div>

      {tab === "generator" ? <ReportGeneratorTab /> : <ChatTab />}
    </AppLayout>
  );
}
