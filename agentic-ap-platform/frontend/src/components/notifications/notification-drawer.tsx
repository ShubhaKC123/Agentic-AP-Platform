import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Trash2 } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import { notificationApi } from "@/services/notification.service";
import { useAppStore } from "@/store/app-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function NotificationDrawer() {
  const open = useAppStore((s) => s.notificationDrawerOpen);
  const setOpen = useAppStore((s) => s.setNotificationDrawerOpen);
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const query = useInfiniteQuery({
    queryKey: ["notifications", "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      notificationApi.list({ page: pageParam, pageSize: 15 }),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    initialPageParam: 1,
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAll = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
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

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {unreadCount} unread · live updates via Socket.io
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => clearAll.mutate()}
            disabled={clearAll.isPending}
            aria-label="Clear all notifications"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="mt-4 flex-1 pr-3">
          {query.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState title="No notifications" description="You're all caught up." />
          ) : (
            <div className="space-y-2 pb-6">
              {items.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                    !n.read && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => {
                    if (!n.read) markRead.mutate(n.id);
                    if (n.entityType === "invoice" && n.entityId) {
                      setOpen(false);
                      navigate(`/invoices/${n.entityId}`);
                    } else if (n.entityType === "vendor" && n.entityId) {
                      setOpen(false);
                      navigate(`/vendors/${n.entityId}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.read ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {formatRelative(n.createdAt)}
                  </p>
                </button>
              ))}

              {query.hasNextPage ? (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              ) : null}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
