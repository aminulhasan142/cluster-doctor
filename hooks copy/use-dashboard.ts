"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/services/dashboard.service";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardService.overview(),
    refetchInterval: 10000,
  });
}
