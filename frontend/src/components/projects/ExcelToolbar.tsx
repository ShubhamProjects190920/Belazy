import { useRef, useState } from "react";
import { Download, FileDown, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { projectApi, type ImportResult } from "@/services/project";
import { getErrorMessage } from "@/services/api";

interface Props {
  onImported: () => void;
}

export function ExcelToolbar({ onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [exportLoading, setExportLoading]     = useState(false);
  const [importLoading, setImportLoading]     = useState(false);
  const [result, setResult]                   = useState<ImportResult | null>(null);
  const [error, setError]                     = useState<string | null>(null);

  async function handleTemplate() {
    setTemplateLoading(true);
    try {
      await projectApi.downloadTemplate();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTemplateLoading(false);
    }
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      await projectApi.exportToExcel();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setExportLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setImportLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await projectApi.importFromExcel(file);
      setResult(data);
      if (data.imported > 0) onImported();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setImportLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Download blank template */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleTemplate}
          isLoading={templateLoading}
          className="flex items-center gap-1.5"
          title="Download blank Excel template"
        >
          <Download className="w-4 h-4" />
          Template
        </Button>

        {/* Import from Excel */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          isLoading={importLoading}
          className="flex items-center gap-1.5"
          title="Import projects from Excel"
        >
          <FileUp className="w-4 h-4" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Export to Excel */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          isLoading={exportLoading}
          className="flex items-center gap-1.5"
          title="Export all projects to Excel"
        >
          <FileDown className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Import result */}
      {result && (
        <div className="flex items-start gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2">
          <span className="flex-1">
            ✓ Imported <strong>{result.imported}</strong> projects
            {result.skipped > 0 && `, ${result.skipped} skipped`}
            {result.errors.length > 0 && (
              <span className="block text-amber-700 mt-0.5">
                {result.errors.join(" · ")}
              </span>
            )}
          </span>
          <button onClick={() => setResult(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
