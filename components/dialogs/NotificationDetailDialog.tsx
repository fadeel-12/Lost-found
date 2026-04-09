"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle,
  Package,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Mail,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { AppNotification } from "@/components/home/NotificationsPanel";

interface NotificationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: AppNotification | null;
  onViewItem: (item: any) => void;
  onOpenChat: (conversationId: string) => void;
}

function formatTime(timestamp: string) {
  const utc = timestamp.endsWith("Z") ? timestamp : `${timestamp}Z`;
  return new Date(utc).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ItemPreviewCard({ item, label }: { item: any; label?: string }) {
  if (!item) return null;
  return (
    <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
      {label && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>}
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 shrink-0">
          <ImageWithFallback
            src={item.imageUrl ?? ""}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
            <Badge variant={item.type === "lost" ? "destructive" : "default"} className="text-xs">
              {item.type === "lost" ? "Lost" : "Found"}
            </Badge>
          </div>
          {item.category && (
            <Badge variant="outline" className="text-xs">{item.category}</Badge>
          )}
          {item.location && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {item.date && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{item.date}</span>
            </div>
          )}
        </div>
      </div>
      {item.description && (
        <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
      )}
    </div>
  );
}

export function NotificationDetailDialog({
  open,
  onOpenChange,
  notification,
  onViewItem,
  onOpenChat,
}: NotificationDetailDialogProps) {
  const [item, setItem] = useState<any>(null);
  const [matchItem, setMatchItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !notification) {
      setItem(null);
      setMatchItem(null);
      return;
    }

    const ids: string[] = [];
    if (notification.itemId) ids.push(notification.itemId);
    if (notification.matchItemId) ids.push(notification.matchItemId);
    if (!ids.length) return;

    setLoading(true);
    Promise.all(
      ids.map((id) =>
        fetch(`/api/items/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    )
      .then(([first, second]) => {
        setItem(first ?? null);
        setMatchItem(second ?? null);
      })
      .finally(() => setLoading(false));
  }, [open, notification]);

  if (!notification) return null;

  const typeIcon = () => {
    switch (notification.type) {
      case "message":
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case "item_match":
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case "item_claimed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };

  const typeBadgeColor = () => {
    switch (notification.type) {
      case "message": return "bg-blue-50 text-blue-700 border-blue-200";
      case "item_match": return "bg-purple-50 text-purple-700 border-purple-200";
      case "item_claimed": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  const typeLabel = () => {
    switch (notification.type) {
      case "message": return "Message";
      case "item_match": return "Potential Match";
      case "item_claimed": return "Item Claimed";
      default: return "System";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              {typeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <DialogTitle className="text-base leading-tight">
                  {notification.title}
                </DialogTitle>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeBadgeColor()}`}>
                  {typeLabel()}
                </span>
              </div>
              <p className="text-xs text-gray-400">{formatTime(notification.timestamp)}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message body */}
          <p className="text-sm text-gray-700 leading-relaxed">{notification.message}</p>

          <Separator />

          {/* Type-specific content */}
          {notification.type === "message" && (
            <div className="space-y-3">
              {notification.senderName && (
                <div className="rounded-lg border bg-blue-50 p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sender</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>{notification.senderName}</span>
                  </div>
                  {notification.senderEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span>{notification.senderEmail}</span>
                    </div>
                  )}
                </div>
              )}
              {item && <ItemPreviewCard item={item} label="Related Item" />}
              {notification.conversationId && (
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenChat(notification.conversationId!);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Open Chat
                </Button>
              )}
            </div>
          )}

          {notification.type === "item_match" && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6 text-sm text-gray-400">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-300 animate-pulse" />
                  Loading item details…
                </div>
              ) : (
                <>
                  {item && (
                    <ItemPreviewCard item={item} label="Your Item" />
                  )}
                  {matchItem && (
                    <ItemPreviewCard item={matchItem} label="Matched Item" />
                  )}
                </>
              )}

              <div className="flex gap-2">
                {item && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => { onOpenChange(false); onViewItem(item); }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Your Item
                  </Button>
                )}
                {matchItem && (
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => { onOpenChange(false); onViewItem(matchItem); }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Match
                  </Button>
                )}
              </div>
            </div>
          )}

          {notification.type === "item_claimed" && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6 text-sm text-gray-400">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-300 animate-pulse" />
                  Loading item details…
                </div>
              ) : (
                item && <ItemPreviewCard item={item} label="Claimed Item" />
              )}
              {item && (
                <Button
                  className="w-full gap-2"
                  onClick={() => { onOpenChange(false); onViewItem(item); }}
                >
                  <ExternalLink className="h-4 w-4" />
                  View Item Details
                </Button>
              )}
            </div>
          )}

          {notification.type === "system" && (
            <div className="rounded-lg border bg-orange-50 p-4 text-sm text-orange-700">
              {notification.message}
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
