"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import queryClient from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";
import { useConnectionStore } from "@/store/connection-store";
import { useRealtimeFeed } from "@/hooks/use-realtime";

function RealtimeProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setConnected = useConnectionStore((s) => s.setConnected);
  const { isConnected } = useRealtimeFeed(isAuthenticated);

  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected, setConnected]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        <RealtimeProvider>{children}</RealtimeProvider>
        <Toaster richColors closeButton position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Providers;
