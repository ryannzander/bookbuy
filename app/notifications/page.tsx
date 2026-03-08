"use client";

import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    return <p className="text-muted-foreground">Loading…</p>;
  }

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        {items.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={markRead.isPending}>
            Mark all as read
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.linkUrl ?? "#"}
              onClick={() => !n.read && markRead.mutate({ id: n.id })}
            >
              <Card className={n.read ? "opacity-80" : "border-primary/30"}>
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="shrink-0 rounded-full bg-primary h-2 w-2" title="Unread" />
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
