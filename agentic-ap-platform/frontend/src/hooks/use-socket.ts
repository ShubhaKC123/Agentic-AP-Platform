import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import { notificationApi } from "@/services/notification.service";
import { useAppStore } from "@/store/app-store";
import type { Invoice, Notification } from "@/types";

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const notificationPrefs = useAppStore((s) => s.notificationPrefs);
  const pollingInterval = useAppStore((s) => s.pollingInterval);

  useEffect(() => {
    let cancelled = false;
    notificationApi
      .unreadCount()
      .then((count) => {
        if (!cancelled) setUnreadCount(count);
      })
      .catch(() => {
        /* backend may still be starting */
      });
    return () => {
      cancelled = true;
    };
  }, [setUnreadCount]);

  useEffect(() => {
    const socket = getSocket();

    const onInvoiceUpdated = (invoice: Invoice) => {
      queryClient.setQueriesData({ queryKey: ["invoices"] }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("data" in old)) return old;
        const typed = old as { data: Invoice[] };
        return {
          ...typed,
          data: typed.data.map((inv) => (inv.id === invoice.id ? invoice : inv)),
        };
      });
      queryClient.setQueryData(["invoice", invoice.id], invoice);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };

    const onInvoiceDeleted = ({ id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.removeQueries({ queryKey: ["invoice", id] });
    };

    const onNotification = (notification: Notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (
        (notification.entityType === "invoice" && notificationPrefs.invoiceUpdates) ||
        (notification.entityType === "vendor" && notificationPrefs.vendorUpdates)
      ) {
        toast(notification.title, { description: notification.message });
      }
    };

    const onUnread = (count: number) => setUnreadCount(count);

    const onConnect = () => {
      notificationApi.unreadCount().then(setUnreadCount).catch(() => undefined);
    };

    socket.on("connect", onConnect);
    socket.on("invoice:updated", onInvoiceUpdated);
    socket.on("invoice:deleted", onInvoiceDeleted);
    socket.on("notification:new", onNotification);
    socket.on("notification:unreadCount", onUnread);
    socket.on("notifications:cleared", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setUnreadCount(0);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("invoice:updated", onInvoiceUpdated);
      socket.off("invoice:deleted", onInvoiceDeleted);
      socket.off("notification:new", onNotification);
      socket.off("notification:unreadCount", onUnread);
      socket.off("notifications:cleared");
    };
  }, [queryClient, setUnreadCount, notificationPrefs]);

  // Fallback polling when the socket is disconnected
  useEffect(() => {
    const ms = Math.max(pollingInterval || 5000, 2000);
    const id = window.setInterval(() => {
      const socket = getSocket();
      if (socket.connected) return;
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      notificationApi.unreadCount().then(setUnreadCount).catch(() => undefined);
    }, ms);
    return () => window.clearInterval(id);
  }, [pollingInterval, queryClient, setUnreadCount]);
}
