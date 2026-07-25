"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useClusters } from "@/hooks/use-cluster";
import { useNodeMutations } from "@/hooks/use-node";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  hostname: z.string().min(2).max(100),
  ip_address: z.string().min(1).max(45),
  cluster_id: z.number().int().positive("Choose a cluster"),
  cpu_cores: z.number().int().min(0),
  gpu_count: z.number().int().min(0),
  ram_gb: z.number().min(0),
  storage_gb: z.number().min(0),
});

type FormValues = z.infer<typeof schema>;

export function NodeFormDialog({
  open,
  onOpenChange,
  defaultClusterId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClusterId?: number;
}) {
  const { data: clusters } = useClusters();
  const { create } = useNodeMutations();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hostname: "",
      ip_address: "",
      cluster_id: defaultClusterId ?? 0,
      cpu_cores: 8,
      gpu_count: 1,
      ram_gb: 64,
      storage_gb: 512,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success("Node registered");
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to register node — hostname/IP may already exist");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register node</DialogTitle>
          <DialogDescription>Add a compute node to a cluster for the AI to monitor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hostname">Hostname</Label>
              <Input id="hostname" placeholder="gpu-node-04" {...form.register("hostname")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ip_address">IP address</Label>
              <Input id="ip_address" placeholder="10.0.0.14" {...form.register("ip_address")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Cluster</Label>
            <Controller
              control={form.control}
              name="cluster_id"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusters?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cpu_cores">CPU cores</Label>
              <Input id="cpu_cores" type="number" {...form.register("cpu_cores", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gpu_count">GPUs</Label>
              <Input id="gpu_count" type="number" {...form.register("gpu_count", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ram_gb">RAM (GB)</Label>
              <Input id="ram_gb" type="number" {...form.register("ram_gb", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storage_gb">Storage (GB)</Label>
              <Input id="storage_gb" type="number" {...form.register("storage_gb", { valueAsNumber: true })} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Register node
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
