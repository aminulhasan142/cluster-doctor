"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Cpu, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  full_name: z.string().min(2, "Name is too short").max(150),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, register: registerUser, isAuthenticated, hasHydrated } = useAuth();
  const [tab, setTab] = useState("login");

  useEffect(() => {
    if (hasHydrated && isAuthenticated) router.replace("/dashboard");
  }, [hasHydrated, isAuthenticated, router]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  const onLogin = loginForm.handleSubmit(async (values) => {
    try {
      await login(values);
      toast.success("Welcome back");
      router.replace("/dashboard");
    } catch {
      toast.error("Invalid email or password");
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    try {
      await registerUser(values);
      toast.success("Account created — sign in to continue");
      setTab("login");
      loginForm.setValue("email", values.email);
    } catch {
      toast.error("Could not create account — email may already be in use");
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="app-backdrop" />
      <div className="grid-overlay" />

      <div className="glass-panel w-full max-w-sm rounded-2xl p-7 animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[var(--ai)] shadow-[var(--shadow-glow-primary)]">
            <Cpu className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Cluster AI Doctor</h1>
            <p className="text-xs text-muted-foreground">Autonomous Cluster Intelligence Platform</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
          <TabsList className="mb-5 grid w-full grid-cols-2">
            <TabsTab value="login">Sign in</TabsTab>
            <TabsTab value="register">Create account</TabsTab>
          </TabsList>

          <TabsPanel value="login">
            <form onSubmit={onLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@cluster.ai"
                  autoComplete="email"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-danger">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-danger">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </TabsPanel>

          <TabsPanel value="register">
            <form onSubmit={onRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  {...registerForm.register("full_name")}
                />
                {registerForm.formState.errors.full_name && (
                  <p className="text-xs text-danger">
                    {registerForm.formState.errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg_email">Email</Label>
                <Input
                  id="reg_email"
                  type="email"
                  placeholder="you@cluster.ai"
                  autoComplete="email"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-danger">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg_password">Password</Label>
                <Input
                  id="reg_password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-danger">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={registerForm.formState.isSubmitting}
              >
                {registerForm.formState.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}
