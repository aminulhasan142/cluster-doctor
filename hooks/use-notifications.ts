"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "@/services/notification.service";
import { useNotificationStore } from "@/store/notification-store";
import { useAuthStore } from "@/store/auth-store";

export function useMyNotifications() {
  const userId = useAuthStore((s) => s.user?.id);
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  const query = useQuery({
    queryKey: ["notifications", "user", userId],
    queryFn: () => notificationService.byUser(userId as number),
    enabled: userId !== undefined,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (query.data) setNotifications(query.data);
  }, [query.data, setNotifications]);

  return query;
}

export function useCriticalNotifications() {
  return useQuery({
    queryKey: ["notifications", "critical"],
    queryFn: () => notificationService.critical(),
    refetchInterval: 15000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  return useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: (_, id) => {
      markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
