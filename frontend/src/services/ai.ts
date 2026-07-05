import { api } from "./api";
import type { AIReport, ChatMessage, ChatResponse, ReportGenerateRequest } from "@/types/ai";

export const aiApi = {
  generateReport: (data: ReportGenerateRequest) =>
    api.post<AIReport>("/ai/reports/generate", data),

  listReports: (params?: { project_id?: string; report_type?: string }) =>
    api.get<AIReport[]>("/ai/reports", { params }),

  getReport: (id: string) =>
    api.get<AIReport>(`/ai/reports/${id}`),

  deleteReport: (id: string) =>
    api.delete(`/ai/reports/${id}`),

  chat: (messages: ChatMessage[]) =>
    api.post<ChatResponse>("/ai/chat", { messages }),
};
