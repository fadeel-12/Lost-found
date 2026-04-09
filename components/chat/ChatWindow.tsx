"use client";

import { useRef, useEffect, useState } from "react";
import {
  Send,
  MessageCircle,
  Package,
  Check,
  CheckCheck,
  Paperclip,
  X,
  ImageIcon,
} from "lucide-react";
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
  const { messages, loading, sending, error, sendMessage, markChatAsRead } =
    useChatMessages({ chatId, currentUserId });

  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!chatId || !currentUserId) return;
    const hasUnread = messages.some((m) => !m.isOwn && !m.is_read);
    if (!hasUnread) return;
    markChatAsRead();
    fetch("/api/notifications/mark-chat-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: chatId }),
    }).catch(() => {});
  }, [chatId, currentUserId, messages, markChatAsRead]);

  const canSend =
    !!chatId && !!currentUserId && !sending && (!!input.trim() || !!imageFile);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSend = async () => {
    if (!canSend) return;
    const text = input.trim();
    const file = imageFile;
    setInput("");
    clearImage();
    await sendMessage(text, file);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b pb-3 mb-3">
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

      {/* Messages */}
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
            {messages.map((msg) => {
              const time = new Date(msg.createdAt).toLocaleTimeString("de-AT", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl text-sm shadow-sm overflow-hidden ${
                      msg.isOwn
                        ? "bg-black text-white rounded-br-sm"
                        : "bg-white text-gray-900 border rounded-bl-sm"
                    }`}
                  >
                    {/* Image attachment */}
                    {msg.imageUrl && (
                      <button
                        type="button"
                        className="block w-full"
                        onClick={() => setLightboxSrc(msg.imageUrl!)}
                      >
                        <img
                          src={msg.imageUrl}
                          alt="attachment"
                          className="max-w-full max-h-56 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                        />
                      </button>
                    )}

                    {/* Text */}
                    {msg.text && (
                      <p className="px-3 py-2 whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                    )}

                    {/* Timestamp + read receipt */}
                    <div
                      className={`flex items-center justify-end gap-2 text-[10px] opacity-70 px-3 pb-1.5 ${
                        !msg.text ? "pt-1" : ""
                      }`}
                    >
                      <span>{time}</span>
                      {msg.isOwn && (
                        <span className="inline-flex items-center gap-0.5">
                          {msg.is_read ? (
                            <>
                              <CheckCheck className="h-3 w-3" />
                              <span>Read</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Sent</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1 mb-1 px-1">{error}</p>}

      {/* Image preview strip */}
      {imagePreview && (
        <div className="border-t pt-2 pb-1 px-1 flex items-center gap-2">
          <div className="relative inline-flex">
            <img
              src={imagePreview}
              alt="preview"
              className="h-16 w-16 rounded-lg object-cover border"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-gray-500 truncate flex-1">{imageFile?.name}</p>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t pt-3 mt-1">
        <div className="flex gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelectImage}
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!chatId || !currentUserId}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            placeholder={chatId ? "Type your message…" : "Select a conversation first"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!chatId || sending || !currentUserId}
            className="flex-1"
          />

          <Button onClick={handleSend} disabled={!canSend} className="gap-2 shrink-0">
            {imageFile && !input.trim() ? (
              <>
                <ImageIcon className="h-4 w-4" />
                Send
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          Press Enter to send · 📎 to attach an image
        </p>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="h-7 w-7" />
          </button>
          <img
            src={lightboxSrc}
            alt="full size"
            className="max-w-full max-h-full rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
