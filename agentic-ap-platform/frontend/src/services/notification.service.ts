import api from "./api";
import type { Notification, NotificationsResponse } from "@/types";

export const notificationApi = {
  list: async (params: { page?: number; pageSize?: number; unreadOnly?: boolean } = {}) => {
    const { data } = await api.get<NotificationsResponse>("/notifications", { params });
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.post<Notification>(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.post<{ success: boolean; count: number }>(
      "/notifications/read-all"
    );
    return data;
  },

  clearAll: async () => {
    const { data } = await api.delete<{ success: boolean }>("/notifications");
    return data;
  },

  unreadCount: async () => {
    const { data } = await api.get<{ count: number }>("/notifications/unread-count");
    return data.count;
  },
};
