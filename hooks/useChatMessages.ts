"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  isOwn: boolean;
};

type UseChatMessagesOptions = {
  chatId: string | null;
  currentUserId: string | null;
};

export function useChatMessages({ chatId, currentUserId }: UseChatMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapDbMessage = useCallback(
    (m: any): ChatMessage => ({
      id: m.id,
      text: m.message,
      senderId: m.sender_id,
      createdAt: m.created_at,
      isOwn: !!currentUserId && m.sender_id === currentUserId,
    }),
    [currentUserId]
  );

  useEffect(() => {
    if (!chatId || !currentUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let aborted = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (!res.ok) {
          setError("Failed to load messages");
          return;
        }

        const data = await res.json();
        const raw = Array.isArray(data?.messages) ? data.messages : [];

        if (!aborted) {
          setMessages(raw.map(mapDbMessage));
        }
      } catch (err) {
        if (!aborted) setError("Failed to load messages");
        console.error("load messages error", err);
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    load();
    return () => {
      aborted = true;
    };
  }, [chatId, currentUserId, mapDbMessage]);

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const channel = supabaseClient
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const m = payload.new as any;
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === m.id)) return prev;

            const withoutTemps = prev.filter(
              (msg) =>
                !msg.id.startsWith("temp-") ||
                msg.senderId !== m.sender_id ||
                msg.text !== m.message
            );

            return [...withoutTemps, mapDbMessage(m)];
          });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [chatId, currentUserId, mapDbMessage]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!chatId || !currentUserId || !text.trim() || sending) return;

      const trimmed = text.trim();
      setSending(true);
      setError(null);

      const tempId = `temp-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: tempId,
        text: trimmed,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        isOwn: true,
      };

      setMessages((prev) => [...prev, optimistic]);

      try {
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });

        if (!res.ok) {
          console.error("Failed to send message");
          setError("Failed to send message");
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }

        const data = await res.json();
        const saved = data?.message;

        if (saved) {
          setMessages((prev) => {
            let withoutTemp = prev.filter((m) => m.id !== tempId);
            if (withoutTemp.some((m) => m.id === saved.id)) {
              return withoutTemp;
            }
            return [...withoutTemp, mapDbMessage(saved)];
          });
        }
      } catch (err) {
        console.error("sendMessage error", err);
        setError("Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setSending(false);
      }
    },
    [chatId, currentUserId, sending, mapDbMessage]
  );

  return { messages, loading, sending, error, sendMessage };
}
