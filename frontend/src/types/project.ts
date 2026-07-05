export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "canceled";
export type ProjectPriority = "low" | "medium" | "high" | "critical";

export interface Project {
  id: string;
  company_id: string;
  created_by_id: string | null;
  name: string;
  description: string | null;
  client_name: string | null;
  location: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  client_name?: string;
  location?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string;
  end_date?: string;
  budget?: number;
}

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  planning:  { label: "Planning",   color: "bg-blue-100 text-blue-800" },
  active:    { label: "Active",     color: "bg-emerald-100 text-emerald-800" },
  on_hold:   { label: "On Hold",    color: "bg-amber-100 text-amber-800" },
  completed: { label: "Completed",  color: "bg-slate-100 text-slate-700" },
  canceled:  { label: "Canceled",   color: "bg-red-100 text-red-700" },
};

export const PRIORITY_CONFIG: Record<ProjectPriority, { label: string; color: string }> = {
  low:      { label: "Low",      color: "bg-slate-100 text-slate-600" },
  medium:   { label: "Medium",   color: "bg-blue-100 text-blue-700" },
  high:     { label: "High",     color: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
};
