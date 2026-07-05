import { api } from "./api";
import type { Project, ProjectCreate } from "@/types/project";

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

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

export const projectApi = {
  list: () =>
    api.get<Project[]>("/projects"),

  get: (id: string) =>
    api.get<Project>(`/projects/${id}`),

  create: (data: ProjectCreate) =>
    api.post<Project>("/projects", data),

  update: (id: string, data: Partial<ProjectCreate>) =>
    api.put<Project>(`/projects/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/projects/${id}`),

  exportToExcel: async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const { data } = await api.get<Blob>("/projects/export", { responseType: "blob" });
    triggerDownload(data, `projects_${today}.xlsx`);
  },

  downloadTemplate: async () => {
    const { data } = await api.get<Blob>("/projects/import/template", { responseType: "blob" });
    triggerDownload(data, "projects_template.xlsx");
  },

  importFromExcel: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ImportResult>("/projects/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
