import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { projectApi } from "@/services/project";
import { getErrorMessage } from "@/services/api";
import type { Project } from "@/types/project";

const schema = z.object({
  name:        z.string().min(1, "Project name is required."),
  client_name: z.string().optional(),
  location:    z.string().optional(),
  description: z.string().optional(),
  status:      z.enum(["planning", "active", "on_hold", "completed", "canceled"]).default("planning"),
  priority:    z.enum(["low", "medium", "high", "critical"]).default("medium"),
  start_date:  z.string().optional(),
  end_date:    z.string().optional(),
  budget:      z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600";

export function CreateProjectModal({ onClose, onCreated }: Props) {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "planning", priority: "medium" },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const { data: project } = await projectApi.create({
        name:        data.name,
        client_name: data.client_name || undefined,
        location:    data.location    || undefined,
        description: data.description || undefined,
        status:      data.status,
        priority:    data.priority,
        start_date:  data.start_date  || undefined,
        end_date:    data.end_date    || undefined,
        budget:      data.budget ? parseFloat(data.budget) : undefined,
      });
      onCreated(project);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

          <Input
            label="Project Name *"
            placeholder="e.g. Highway Bridge Expansion"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Client Name"
              placeholder="e.g. NHAI"
              {...register("client_name")}
            />
            <Input
              label="Location"
              placeholder="e.g. Mumbai, MH"
              {...register("location")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select className={selectClass} {...register("status")}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <select className={selectClass} {...register("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" {...register("start_date")} />
            <Input label="End Date"   type="date" {...register("end_date")} />
          </div>

          <Input
            label="Budget (₹)"
            type="number"
            placeholder="e.g. 5000000"
            {...register("budget")}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Brief project description…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 resize-none"
              {...register("description")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
