"use client";

import { useRef, useEffect, useState } from "react";
import { Send, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages } from "@/hooks/useChatMessages";

interface ChatWindowProps {
  chatId: string | null;
  currentUserId: string | null;
  title?: string;
  subtitle?: string;
}

export function ChatWindow({
  chatId,
  currentUserId,
  title = "Chat",
  subtitle,
}: ChatWindowProps) {
  const { messages, loading, sending, error, sendMessage } = useChatMessages({
    chatId,
    currentUserId,
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b pb-3 mb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{title}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-sm text-gray-500 px-4">
            <MessageCircle className="h-10 w-10 text-gray-300 mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    msg.isOwn
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-900 border rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <p className="text-[10px] mt-1 opacity-70 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString("de-AT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 mt-1 mb-1 px-1">{error}</p>
      )}

      {/* Input */}
      <div className="border-t pt-3 mt-2">
        <div className="flex gap-2">
          <Input
            placeholder={
              chatId ? "Type your message…" : "Select a conversation first"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!chatId || sending || !currentUserId}
          />
          <Button
            onClick={handleSend}
            disabled={!chatId || sending || !input.trim() || !currentUserId}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
