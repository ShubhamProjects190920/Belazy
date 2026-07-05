export interface RecentProject {
  id: string;
  name: string;
  status: string;
  priority: string;
  client_name: string | null;
  created_at: string;
}

export interface StatusBreakdown {
  status: string;
  label: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  on_hold_projects: number;
  completed_projects: number;
  planning_projects: number;
  total_budget: number | null;
  team_members: number;
  plan: string;
  recent_projects: RecentProject[];
  status_breakdown: StatusBreakdown[];
}
