"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useClusterMutations } from "@/hooks/use-cluster";
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
import { Textarea } from "@/components/ui/textarea";
import type { Cluster } from "@/types";

const schema = z.object({
  name: z.string().min(2, "At least 2 characters").max(100),
  description: z.string().max(1000).optional().or(z.literal("")),
  location: z.string().max(150).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function ClusterFormDialog({
  open,
  onOpenChange,
  cluster,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cluster?: Cluster | null;
}) {
  const { create, update } = useClusterMutations();
  const isEditing = !!cluster;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", location: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: cluster?.name ?? "",
        description: cluster?.description ?? "",
        location: cluster?.location ?? "",
      });
    }
  }, [open, cluster, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditing && cluster) {
        await update.mutateAsync({ id: cluster.id, data: values });
        toast.success("Cluster updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Cluster created");
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? "Failed to update cluster" : "Failed to create cluster");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit cluster" : "New cluster"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update cluster metadata." : "Register a new compute cluster for the AI to monitor."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="us-east-1 / on-prem-dc2" {...form.register("location")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEditing ? "Save changes" : "Create cluster"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
