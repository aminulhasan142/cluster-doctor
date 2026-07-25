"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import type { LoginRequest, RegisterRequest } from "@/types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    hasHydrated,
    setSession,
    setLoading,
    hydrate,
    logout: clearSession,
  } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) hydrate();
  }, [hasHydrated, hydrate]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onMutate: () => setLoading(true),
    onSuccess: (response) => {
      setSession(response.user, response.access_token, response.refresh_token);
    },
    onSettled: () => setLoading(false),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });

  const signOut = useCallback(async () => {
    await authService.logout();
    clearSession();
    queryClient.clear();
    router.push("/login");
  }, [clearSession, queryClient, router]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    hasHydrated,

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as Error | null,

    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error as Error | null,

    signOut,
  };
}
