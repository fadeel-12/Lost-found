"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type UseChatMessagesArgs = {
  chatId: string | null;
  currentUserId: string | null;
};

export type UIMessage = {
  id: string;
  text: string;
  createdAt: string;
  isOwn: boolean;
  is_read: boolean;
};

export function useChatMessages({ chatId, currentUserId }: UseChatMessagesArgs) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUse = useMemo(() => !!chatId && !!currentUserId, [chatId, currentUserId]);

  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, message, is_read, created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const mapped: UIMessage[] =
      data?.map((row) => ({
        id: row.id,
        text: row.message,
        createdAt: row.created_at,
        is_read: !!row.is_read,
        isOwn: currentUserId ? row.sender_id === currentUserId : false,
      })) ?? [];

    setMessages(mapped);
    setLoading(false);
  }, [chatId, currentUserId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!canUse) return;

      setSending(true);
      setError(null);

      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: currentUserId,
        message: text,
        is_read: false,
      });

      if (error) setError(error.message);
      setSending(false);
    },
    [canUse, chatId, currentUserId]
  );

  const markChatAsRead = useCallback(async () => {
    if (!canUse) return;

    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("chat_id", chatId)
      .neq("sender_id", currentUserId)
      .eq("is_read", false);

    if (error) {
      console.error("markChatAsRead:", error.message);
      return;
    }

    setMessages((prev) =>
      prev.map((m) => (m.isOwn ? m : { ...m, is_read: true }))
    );
  }, [canUse, chatId, currentUserId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    markChatAsRead,
  };
}
