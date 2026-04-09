"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/chat/ChatWindow";

type ItemChatSummary = {
  id: string;
  itemId: string | null;
  itemTitle: string;
  itemType: "lost" | "found" | null;
  otherUserId: string | null;
  otherUserName: string;
  otherUserEmail: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

interface ItemMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  currentUserId: string | null;
  initialChatId?: string | null;
  initialChatMeta?: {
    otherUserName?: string;
    itemTitle?: string;
  } | null;
}

function formatRelativeTime(ts: string) {
  const utc = ts.endsWith("Z") ? ts : `${ts}Z`;
  const diff = Date.now() - new Date(utc).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ItemMessagesDialog({
  open,
  onOpenChange,
  itemId,
  currentUserId,
  initialChatId,
  initialChatMeta,
}: ItemMessagesDialogProps) {
  const [chats, setChats] = useState<ItemChatSummary[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !currentUserId) {
      setChats([]);
      setActiveChatId(null);
      return;
    }

    let cancelled = false;

    const loadChats = async () => {
      try {
        setLoadingChats(true);
        const res = await fetch("/api/chats/my");
        if (!res.ok) return;

        const data = await res.json();
        const all: ItemChatSummary[] = (Array.isArray(data?.chats) ? data.chats : []).map(
          (c: any) => ({
            id: c.id,
            itemId: c.itemId ?? c.item_id ?? null,
            itemTitle: c.itemTitle ?? c.item_title ?? "Item",
            itemType: c.itemType ?? c.item_type ?? null,
            otherUserId: c.otherUserId ?? c.other_user_id ?? null,
            otherUserName: c.otherUserName ?? c.other_user_name ?? "User",
            otherUserEmail: c.otherUserEmail ?? c.other_user_email ?? "",
            lastMessage: c.lastMessage ?? c.last_message ?? null,
            lastMessageAt: c.lastMessageAt ?? c.last_message_at ?? "",
            unreadCount: c.unreadCount ?? 0,
          })
        );

        const filtered = itemId ? all.filter((c) => c.itemId === itemId) : all;

        if (cancelled) return;
        setChats(filtered);

        setActiveChatId((prev) => {
          if (filtered.length === 0) return null;
          if (initialChatId && filtered.some((x) => x.id === initialChatId))
            return initialChatId;
          if (prev && filtered.some((x) => x.id === prev)) return prev;
          return filtered[0].id;
        });
      } catch (err) {
        console.error("load chats error", err);
      } finally {
        if (!cancelled) setLoadingChats(false);
      }
    };

    loadChats();
    return () => { cancelled = true; };
  }, [open, itemId, currentUserId, initialChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const effectiveChatId = activeChatId ?? initialChatId ?? null;

  const headerTitle = activeChat?.otherUserName
    ? `Chat with ${activeChat.otherUserName}`
    : initialChatMeta?.otherUserName
    ? `Chat with ${initialChatMeta.otherUserName}`
    : "Messages";

  const chatSubtitle =
    activeChat?.itemTitle ??
    initialChatMeta?.itemTitle ??
    null;

  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setActiveChatId(null);
          setChats([]);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="w-[95vw] max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="border-b pb-3 mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base truncate">{headerTitle}</DialogTitle>
                {chatSubtitle && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <Package className="h-3 w-3 shrink-0" />
                    {chatSubtitle}
                  </p>
                )}
              </div>
            </div>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white shrink-0">
                {totalUnread} unread
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 gap-4">
          {/* Conversations sidebar */}
          <div className="w-64 border-r pr-3 flex flex-col shrink-0">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Conversations
            </p>
            <div className="flex-1 overflow-y-auto space-y-1">
              {loadingChats ? (
                <p className="text-sm text-gray-400 mt-4 text-center">Loading…</p>
              ) : chats.length === 0 ? (
                <div className="text-center mt-8 px-2">
                  <MessageCircle className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No conversations yet</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const isActive = activeChatId === chat.id;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setActiveChatId(chat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                        isActive
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <span className="font-medium text-sm truncate leading-tight">
                          {chat.otherUserName}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="shrink-0 h-5 min-w-5 px-1 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mb-1">
                        {chat.itemType && (
                          <Badge
                            variant={chat.itemType === "lost" ? "destructive" : "default"}
                            className="text-[10px] px-1 py-0 h-4"
                          >
                            {chat.itemType}
                          </Badge>
                        )}
                        <span className="text-[11px] text-gray-500 truncate">
                          {chat.itemTitle}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] text-gray-400 truncate flex-1">
                          {chat.lastMessage ?? "No messages yet"}
                        </p>
                        {chat.lastMessageAt && (
                          <span className="text-[10px] text-gray-300 shrink-0">
                            {formatRelativeTime(chat.lastMessageAt)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 min-w-0">
            {effectiveChatId && currentUserId ? (
              <ChatWindow
                chatId={effectiveChatId}
                currentUserId={currentUserId}
                title={headerTitle}
                subtitle={chatSubtitle ?? undefined}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <MessageCircle className="h-10 w-10 text-gray-200" />
                <p className="text-sm">
                  {chats.length === 0
                    ? "No conversations yet."
                    : "Select a conversation to start chatting."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 self-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
