import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationApi } from "@/services/notification.service";
import { formatDate, formatRelative, cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useNavigate } from "react-router-dom";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", "page"],
    queryFn: () => notificationApi.list({ page: 1, pageSize: 50 }),
  });

  const markRead = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All marked as read");
    },
  });

  const clearAll = useMutation({
    mutationFn: notificationApi.clearAll,
    onSuccess: () => {
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notifications cleared");
    },
  });

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Activity stream for invoice processing and vendor changes."
        actions={
          <>
            <Button variant="outline" onClick={() => markAll.mutate()}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
            <Button variant="outline" onClick={() => clearAll.mutate()}>
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          </>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <EmptyState title="No notifications" description="New events will appear here in real time." />
      ) : (
        <div className="space-y-2">
          {data.data.map((n) => (
            <button
              key={n.id}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-colors hover:bg-muted/40",
                !n.read && "border-primary/30 bg-primary/5"
              )}
              onClick={() => {
                if (!n.read) markRead.mutate(n.id);
                if (n.entityType === "invoice" && n.entityId) navigate(`/invoices/${n.entityId}`);
                if (n.entityType === "vendor" && n.entityId) navigate(`/vendors/${n.entityId}`);
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{formatRelative(n.createdAt)}</p>
                  <p className="mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
