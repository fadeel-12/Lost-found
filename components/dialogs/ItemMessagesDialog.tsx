"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../dialog";
import { Button } from "../button";
import { ChatWindow } from "../chat/ChatWindow";
import { MessageCircle } from "lucide-react";

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
}

export function ItemMessagesDialog({
  open,
  onOpenChange,
  itemId,
  currentUserId,
  initialChatId,
}: ItemMessagesDialogProps) {
  const [chats, setChats] = useState<ItemChatSummary[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !itemId || !currentUserId) {
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

        const itemChats: ItemChatSummary[] = all
          .filter((c: any) => c.itemId === itemId)
          .map((c: any) => ({
            id: c.id,
            itemId: c.itemId,
            itemTitle: c.itemTitle,
            itemType: c.itemType,
            otherUserId: c.otherUserId,
            otherUserName: c.otherUserName,
            otherUserEmail: c.otherUserEmail,
            lastMessage: c.lastMessage,
            lastMessageAt: c.lastMessageAt,
          }));

        if (cancelled) return;

        setChats(itemChats);

        // pick active chat
        if (itemChats.length === 0) {
          setActiveChatId(null);
        } else if (initialChatId && itemChats.some((c) => c.id === initialChatId)) {
          setActiveChatId(initialChatId);
        } else if (!activeChatId || !itemChats.some((c) => c.id === activeChatId)) {
          setActiveChatId(itemChats[0].id);
        }
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
  }, [open, itemId, currentUserId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const headerTitle = activeChat
    ? `Chat with ${activeChat.otherUserName}`
    : "Messages";
  const headerSubtitle = activeChat
    ? `Regarding item: ${activeChat.itemTitle}`
    : undefined;

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
            <div>
              <DialogTitle className="text-base">
                {headerTitle}
              </DialogTitle>
              <DialogDescription>
                View and reply to all conversations
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 gap-4">
          <div className="w-64 border-r pr-3 flex flex-col">
            <p className="text-xs text-gray-500 mb-2">
              Conversations
            </p>
            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Loading chats…
                </p>
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
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition
                        ${
                          activeChatId === chat.id
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        }`}
                    >
                      <div className="font-medium truncate">
                        {chat.otherUserName}
                      </div>
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
            {activeChatId && currentUserId ? (
              <ChatWindow
                chatId={activeChatId}
                currentUserId={currentUserId}
                title={headerTitle}
                subtitle={headerSubtitle}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                {chats.length === 0
                  ? "No conversations yet."
                  : "Select a conversation from the left."}
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
