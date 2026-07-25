import { mockStore } from "./mock-store";
import type { AppNotification } from "@/types";

class NotificationService {
  async get(id: number | string): Promise<AppNotification> {
    const list = mockStore.getNotifications();
    const notif = list.find((n) => n.id === Number(id));
    if (!notif) throw new Error("Notification not found");
    return notif;
  }

  async byUser(_userId: number | string): Promise<AppNotification[]> {
    return mockStore.getNotifications();
  }

  async unreadByUser(_userId: number | string): Promise<AppNotification[]> {
    return mockStore.getUnreadNotifications();
  }

  async critical(): Promise<AppNotification[]> {
    return mockStore
      .getNotifications()
      .filter((n) => n.threat_level === "CRITICAL" || n.threat_level === "HIGH");
  }

  async markRead(id: number | string): Promise<AppNotification> {
    return mockStore.markNotificationRead(id);
  }

  async remove(id: number | string): Promise<void> {
    // optional delete
  }
}

export const notificationService = new NotificationService();
