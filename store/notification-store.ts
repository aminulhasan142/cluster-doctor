import { create } from "zustand";

import type { AppNotification } from "@/types";

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;

  setNotifications: (notifications: AppNotification[]) => void;
  pushNotification: (notification: AppNotification) => void;
  markAsRead: (id: number) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => n.status === "UNREAD").length,
    }),

  pushNotification: (notification) =>
    set((state) => {
      if (state.notifications.some((n) => n.id === notification.id)) {
        return state;
      }

      const notifications = [notification, ...state.notifications].slice(0, 50);

      return {
        notifications,
        unreadCount: notifications.filter((n) => n.status === "UNREAD").length,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, status: "READ" as const } : n
      );

      return {
        notifications,
        unreadCount: notifications.filter((n) => n.status === "UNREAD").length,
      };
    }),

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
