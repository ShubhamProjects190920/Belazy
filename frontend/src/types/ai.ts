export type AIReportType = "daily" | "weekly" | "monthly";

export interface AIReport {
  id: string;
  company_id: string;
  project_id: string | null;
  report_type: AIReportType;
  title: string;
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export interface ReportGenerateRequest {
  project_id: string;
  report_type: AIReportType;
  extra_context?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  input_tokens: number;
  output_tokens: number;
}
