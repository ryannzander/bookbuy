"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare, Send, User } from "lucide-react";

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
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-6">
      {/* Thread List */}
      <div className="lg:w-80 shrink-0 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : threads.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="No conversations"
                description="Start by contacting a seller from a listing page."
              />
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((t) => {
                const last = t.messages[0];
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full rounded-xl p-4 text-left transition-all duration-200 ${
                      selectedThreadId === t.id
                        ? "bg-foreground text-background"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium truncate ${
                        selectedThreadId === t.id
                          ? "text-background"
                          : "text-foreground"
                      }`}
                    >
                      {t.listing?.title ?? "Direct message"}
                    </p>
                    <p
                      className={`text-xs truncate mt-1 ${
                        selectedThreadId === t.id
                          ? "text-background/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {last?.body ?? "No messages yet"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Conversation</h2>
        </div>

        {!selectedThreadId ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              title="Select a conversation"
              description="Choose a thread from the left to view messages."
            />
          </div>
        ) : threadQuery.isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : threadQuery.error || !threadQuery.data ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-destructive">Could not load thread.</p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {threadQuery.data.messages.map((m) => (
                <div key={m.id} className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {m.sender.name ?? m.sender.email}
                    </p>
                    <div className="rounded-2xl rounded-tl-none bg-secondary p-4">
                      <p className="text-sm text-foreground">{m.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-3">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && draft.trim() && selectedThreadId) {
                      send.mutate({
                        threadId: selectedThreadId,
                        body: draft.trim(),
                      });
                      setDraft("");
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (!draft.trim() || !selectedThreadId) return;
                    send.mutate({
                      threadId: selectedThreadId,
                      body: draft.trim(),
                    });
                    setDraft("");
                  }}
                  disabled={send.isPending || !draft.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            Loading messages...
          </div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
