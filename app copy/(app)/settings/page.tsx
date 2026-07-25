"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { userService } from "@/services/user.service";
import { APP_CONFIG } from "@/constants/config";
import { useConnectionStore } from "@/store/connection-store";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  full_name: z.string().min(2).max(150),
});

const passwordSchema = z.object({
  password: z.string().min(8, "At least 8 characters"),
});

export default function SettingsPage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const isConnected = useConnectionStore((s) => s.isConnected);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { full_name: user?.full_name ?? "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const updateProfile = useMutation({
    mutationFn: (values: z.infer<typeof profileSchema>) => userService.updateMe(values),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const updatePassword = useMutation({
    mutationFn: (values: z.infer<typeof passwordSchema>) => userService.updateMe(values),
    onSuccess: () => {
      passwordForm.reset();
      toast.success("Password updated");
    },
    onError: () => toast.error("Failed to update password"),
  });

  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title="Settings" description="Account, appearance, and connection details." />

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...profileForm.register("full_name")} />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Role: <Badge variant="outline">{user?.role}</Badge>
            </div>
            <Button type="submit" size="sm" disabled={updateProfile.isPending}>
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((v) => updatePassword.mutate(v))}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" {...passwordForm.register("password")} />
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-danger">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" size="sm" disabled={updatePassword.isPending}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>System</CardTitle>
          <CardDescription>Environment and live connection info.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="API base URL" value={APP_CONFIG.apiBaseUrl} />
          <Row label="WebSocket URL" value={APP_CONFIG.websocketUrl} />
          <Row
            label="Realtime connection"
            value={
              <Badge
                variant="outline"
                className={
                  isConnected
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-border bg-muted text-muted-foreground"
                }
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            }
          />
          <Row label="Theme" value={<Badge variant="outline">Dark (fixed)</Badge>} />
          <Row label="Version" value={APP_CONFIG.version} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
