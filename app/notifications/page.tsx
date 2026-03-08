"use client";

import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell, Check, ExternalLink } from "lucide-react";

export default function NotificationsPage() {
  const { data, isLoading } = api.notification.getMine.useQuery({ limit: 50 });
  const utils = api.useUtils();
  const markRead = api.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.getMine.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllRead = () => markRead.mutate({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          Loading notifications...
        </div>
      </div>
    );
  }

  const items = data?.items ?? [];
  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {items.length} notification{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={markRead.isPending}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.linkUrl ?? "#"}
              onClick={() => !n.read && markRead.mutate({ id: n.id })}
              className={`block rounded-2xl border p-5 transition-all duration-200 hover:border-muted-foreground/30 ${
                n.read
                  ? "border-border bg-card/50"
                  : "border-foreground/30 bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold ${
                        n.read ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-foreground shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {n.body}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {n.linkUrl && (
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
