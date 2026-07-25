"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWebSocket, broadcastSimulatedEvent } from "@/hooks/use-websocket";
import { useNotificationStore } from "@/store/notification-store";
import type { AppNotification, ThreatLevel } from "@/types";

interface PredictionBroadcast {
  event: "prediction";
  timestamp: string;
  prediction: { id: number; node_id: number; cluster_id: number; risk_score?: number };
  notification: (Partial<AppNotification> & { id: number; title: string; message: string }) | null;
}

const THREAT_TOAST: Record<ThreatLevel, (msg: string, opts: { description?: string }) => void> = {
  LOW: (msg, opts) => toast.info(msg, opts),
  MEDIUM: (msg, opts) => toast.warning(msg, opts),
  HIGH: (msg, opts) => toast.warning(msg, opts),
  CRITICAL: (msg, opts) => toast.error(msg, opts),
};

export function useRealtimeFeed(enabled = true) {
  const queryClient = useQueryClient();
  const pushNotification = useNotificationStore((s) => s.pushNotification);
  const { isConnected, subscribe } = useWebSocket(enabled ? "ws://mock" : "");

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribe<any>((payload) => {
      if (!payload || typeof payload !== "object") return;

      if ("event" in payload && payload.event === "prediction") {
        const msg = payload as PredictionBroadcast;

        queryClient.invalidateQueries({ queryKey: ["predictions"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["nodes"] });

        if (msg.notification) {
          const level = (msg.notification.threat_level as ThreatLevel) ?? "LOW";
          const toastFn = THREAT_TOAST[level] ?? THREAT_TOAST.LOW;

          toastFn(msg.notification.title ?? "New AI Event", {
            description: msg.notification.message,
          });

          pushNotification({
            id: msg.notification.id,
            title: msg.notification.title ?? "AI Event",
            message: msg.notification.message ?? "",
            category: msg.notification.category ?? "prediction",
            threat_level: level,
            user_id: msg.notification.user_id ?? 1,
            cluster_id: msg.prediction.cluster_id,
            node_id: msg.prediction.node_id,
            prediction_id: msg.prediction.id,
            status: msg.notification.status ?? "UNREAD",
            read_at: null,
            created_at: msg.timestamp,
            updated_at: msg.timestamp,
          });

          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      }
    });

    // Periodic gentle telemetry pulse (every 45 seconds) to simulate dynamic cluster state
    const timer = setInterval(() => {
      const randomNodeId = [101, 102, 103][Math.floor(Math.random() * 3)];
      broadcastSimulatedEvent({
        event: "telemetry_pulse",
        timestamp: new Date().toISOString(),
        node_id: randomNodeId,
      });
      queryClient.invalidateQueries({ queryKey: ["telemetry"] });
    }, 45000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [enabled, subscribe, queryClient, pushNotification]);

  return { isConnected };
}
