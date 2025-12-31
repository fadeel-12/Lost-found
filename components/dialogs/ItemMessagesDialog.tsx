"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        if (!res.ok) {
          console.error("Failed to load chats");
          return;
        }

        const data = await res.json();
        const all = Array.isArray(data?.chats) ? data.chats : [];

        const filtered = itemId
          ? all.filter((c: any) => (c.itemId ?? c.item_id) === itemId)
          : all;

        const mapped: ItemChatSummary[] = filtered.map((c: any) => ({
          id: c.id,
          itemId: c.itemId ?? c.item_id ?? null,
          itemTitle: c.itemTitle ?? c.item_title ?? "Item",
          itemType: c.itemType ?? c.item_type ?? null,
          otherUserId: c.otherUserId ?? c.other_user_id ?? null,
          otherUserName: c.otherUserName ?? c.other_user_name ?? "User",
          otherUserEmail: c.otherUserEmail ?? c.other_user_email ?? "",
          lastMessage: c.lastMessage ?? c.last_message ?? null,
          lastMessageAt: c.lastMessageAt ?? c.last_message_at ?? "",
        }));

        if (cancelled) return;

        setChats(mapped);

        setActiveChatId((prev) => {
          if (mapped.length === 0) return null;

          if (initialChatId && mapped.some((x) => x.id === initialChatId)) {
            return initialChatId;
          }

          if (prev && mapped.some((x) => x.id === prev)) {
            return prev;
          }

          return mapped[0].id;
        });
      } catch (err) {
        console.error("load item chats error", err);
      } finally {
        if (!cancelled) setLoadingChats(false);
      }
    };

    loadChats();

    return () => {
      cancelled = true;
    };
  }, [open, itemId, currentUserId, initialChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const headerTitle =
    activeChat?.otherUserName
      ? `Chat with ${activeChat.otherUserName}`
      : initialChatMeta?.otherUserName
        ? `Chat with ${initialChatMeta.otherUserName}`
        : "Messages";
  const effectiveChatId = activeChatId ?? initialChatId ?? null;

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
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base">{headerTitle}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 gap-4">
          <div className="w-64 border-r pr-3 flex flex-col">
            <p className="text-xs text-gray-500 mb-2">Conversations</p>
            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <p className="text-sm text-gray-500 mt-4 text-center">Loading chats…</p>
              ) : chats.length === 0 ? (
                <p className="text-sm text-gray-500 mt-4 text-center px-2">
                  No conversations yet
                </p>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setActiveChatId(chat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${activeChatId === chat.id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                        }`}
                    >
                      <div className="font-medium truncate">{chat.otherUserName}</div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {chat.lastMessage || "No messages yet"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {effectiveChatId && currentUserId ? (
              <ChatWindow
                chatId={effectiveChatId}
                currentUserId={currentUserId}
                title={headerTitle}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                {chats.length === 0 ? "No conversations yet." : "Select a conversation from the left."}
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
