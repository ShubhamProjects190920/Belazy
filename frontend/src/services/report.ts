import { api } from "./api";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

export const reportApi = {
  downloadProjectSummaryPdf: async () => {
    const { data } = await api.get<Blob>("/reports/project-summary/pdf", { responseType: "blob" });
    triggerDownload(data, `project_summary_${today()}.pdf`);
  },

  downloadProjectPptx: async () => {
    const { data } = await api.get<Blob>("/reports/project-summary/pptx", { responseType: "blob" });
    triggerDownload(data, `project_status_${today()}.pptx`);
  },

  downloadAiReportPdf: async (reportId: string, title: string) => {
    const { data } = await api.get<Blob>(`/reports/ai-reports/${reportId}/pdf`, { responseType: "blob" });
    const safe = title.replace(/[^a-zA-Z0-9\-_ ]/g, "").trim();
    triggerDownload(data, `${safe}.pdf`);
  },

  emailAiReport: (reportId: string, toEmail: string) =>
    api.post(`/reports/ai-reports/${reportId}/email`, { to_email: toEmail }),
};
