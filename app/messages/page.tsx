"use client";

import { useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

function MessagesContent() {
  const searchParams = useSearchParams();
  const { data: threads = [], isLoading } = api.message.listThreads.useQuery();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    searchParams.get("thread")
  );
  const threadQuery = api.message.getThread.useQuery(
    { threadId: selectedThreadId ?? "" },
    { enabled: !!selectedThreadId }
  );
  const utils = api.useUtils();
  const send = api.message.send.useMutation({
    onSuccess: () => {
      if (selectedThreadId) {
        utils.message.getThread.invalidate({ threadId: selectedThreadId });
      }
      utils.message.listThreads.invalidate();
    },
  });
  const [draft, setDraft] = useState("");

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="h-[70vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading conversations...</p>
          ) : threads.length === 0 ? (
            <EmptyState
              title="No conversations"
              description="Start by contacting a seller from a listing page."
            />
          ) : (
            threads.map((t) => {
              const last = t.messages[0];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedThreadId(t.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedThreadId === t.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <p className="text-sm font-medium">
                    {t.listing?.title ?? "Direct message"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {last?.body ?? "No messages yet"}
                  </p>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="h-[70vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[58vh] flex-col">
          {!selectedThreadId ? (
            <EmptyState
              title="Select a conversation"
              description="Choose a thread from the left to view messages."
            />
          ) : threadQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading thread...</p>
          ) : threadQuery.error || !threadQuery.data ? (
            <p className="text-sm text-destructive">Could not load thread.</p>
          ) : (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {threadQuery.data.messages.map((m) => (
                  <div key={m.id} className="rounded-lg border border-border bg-muted/30 p-2.5">
                    <p className="text-xs text-muted-foreground">{m.sender.name ?? "User"}</p>
                    <p className="text-sm">{m.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your message..."
                />
                <Button
                  onClick={() => {
                    if (!draft.trim() || !selectedThreadId) return;
                    send.mutate({ threadId: selectedThreadId, body: draft.trim() });
                    setDraft("");
                  }}
                  disabled={send.isPending || !draft.trim()}
                >
                  Send
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading messages...</p>}>
      <MessagesContent />
    </Suspense>
  );
}
