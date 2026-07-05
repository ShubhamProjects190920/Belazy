import { create } from "zustand";
import type { Company } from "@/types/company";

interface CompanyStore {
  company: Company | null;
  setCompany: (company: Company | null) => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  company: null,
  setCompany: (company) => set({ company }),
}));
