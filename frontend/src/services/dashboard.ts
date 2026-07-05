import { api } from "./api";
import type { DashboardStats } from "@/types/dashboard";

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/dashboard"),
};
