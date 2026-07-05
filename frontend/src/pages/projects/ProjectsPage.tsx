import { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  FolderKanban,
  IndianRupee,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ExcelToolbar } from "@/components/projects/ExcelToolbar";
import { projectApi } from "@/services/project";
import { getErrorMessage } from "@/services/api";
import {
  type Project,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from "@/types/project";
import { useAuthStore } from "@/store/authStore";

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ProjectCard({
  project,
  isAdmin,
  onDelete,
}: {
  project: Project;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  const status   = STATUS_CONFIG[project.status];
  const priority = PRIORITY_CONFIG[project.priority];

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

  const formatBudget = (b: number | null) =>
    b != null
      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(b)
      : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{project.name}</h3>
          {project.client_name && (
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              {project.client_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
          {isAdmin && (
            <button
              onClick={() => onDelete(project.id)}
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className={`font-semibold px-2 py-0.5 rounded ${priority.color}`}>
          {priority.label}
        </span>
        {project.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {project.location}
          </span>
        )}
        {(project.start_date || project.end_date) && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(project.start_date)} {project.end_date ? `→ ${formatDate(project.end_date)}` : ""}
          </span>
        )}
        {project.budget != null && (
          <span className="flex items-center gap-1">
            <IndianRupee className="w-3 h-3" /> {formatBudget(project.budget)}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  function reloadProjects() {
    projectApi.list().then(({ data }) => setProjects(data)).catch(() => {});
  }

  useEffect(() => {
    projectApi
      .list()
      .then(({ data }) => setProjects(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await projectApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const counts = {
    total:     projects.length,
    active:    projects.filter((p) => p.status === "active").length,
    onHold:    projects.filter((p) => p.status === "on_hold").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  return (
    <AppLayout
      title="Projects"
      subtitle="Manage all your construction projects"
      actions={
        <div className="flex items-center gap-3">
          <ExcelToolbar onImported={reloadProjects} />
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total"     value={counts.total}     color="text-slate-900" />
          <StatCard label="Active"    value={counts.active}    color="text-emerald-600" />
          <StatCard label="On Hold"   value={counts.onHold}    color="text-amber-600" />
          <StatCard label="Completed" value={counts.completed} color="text-slate-500" />
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="font-semibold text-slate-700 mb-1">No projects yet</h3>
            <p className="text-sm text-slate-500 mb-4">Create your first project to get started.</p>
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                isAdmin={isAdmin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </AppLayout>
  );
}
