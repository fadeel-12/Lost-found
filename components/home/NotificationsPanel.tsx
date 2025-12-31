"use client";

import { useState } from "react";
import {
    Bell,
    MessageCircle,
    CheckCircle,
    Package,
    AlertCircle,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type AppNotificationType =
    | "message"
    | "item_match"
    | "item_claimed"
    | "system";

export type AppNotification = {
    id: string;
    type: AppNotificationType;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    conversationId?: string;
    itemId?: string;
    matchItemId?: string;
    senderName?: string;
    senderEmail?: string;
    itemTitle?: string;
    itemStatus?: "lost" | "found";
};

type Props = {
    notifications: AppNotification[];
    onNotificationClick: (n: AppNotification) => void;

    onMarkAsRead: (id: string) => void | Promise<void>;
    onMarkAllAsRead: () => void | Promise<void>;
    onDeleteNotification: (id: string) => void | Promise<void>;
};

export function NotificationsPanel({
    notifications,
    onNotificationClick,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification,
}: Props) {
    const [open, setOpen] = useState(false);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const getNotificationIcon = (type: AppNotificationType) => {
        switch (type) {
            case "message":
                return <MessageCircle className="h-5 w-5 text-blue-600" />;
            case "item_match":
                return <Package className="h-5 w-5 text-purple-600" />;
            case "item_claimed":
                return <CheckCircle className="h-5 w-5 text-purple-600" />;
            case "system":
            default:
                return <AlertCircle className="h-5 w-5 text-orange-600" />;
        }
    };

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    const formatTime = (timestamp: string) => {
        const utcTimestamp = timestamp.endsWith("Z") ? timestamp : `${timestamp}Z`;
        const date = new Date(utcTimestamp);
        const now = Date.now();

        const diffSeconds = Math.floor((now - date.getTime()) / 1000);
        if (diffSeconds < 10) return "Just now";
        if (diffSeconds < 60) return `${diffSeconds}s ago`;

        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const handleClick = async (n: AppNotification) => {
        if (!n.read) await onMarkAsRead(n.id);
        onNotificationClick(n);
        setOpen(false);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-96 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge className="bg-red-600 text-white h-5 px-2">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => onMarkAllAsRead()}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`relative group hover:bg-gray-50 ${!n.read ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <button
                                        onClick={() => handleClick(n)}
                                        className="w-full p-4 text-left"
                                        type="button"
                                    >
                                        <div className="flex gap-3">
                                            {n.type === "message" && n.senderName ? (
                                                <Avatar className="h-10 w-10 shrink-0">
                                                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                                                        {getInitials(n.senderName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    {getNotificationIcon(n.type)}
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className="text-sm pr-2">{n.title}</h4>
                                                    {!n.read && (
                                                        <div className="h-2 w-2 bg-blue-600 rounded-full shrink-0 mt-1" />
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-600 mb-1">{n.message}</p>

                                                <span className="text-xs text-gray-400">
                                                    {formatTime(n.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteNotification(n.id);
                                        }}
                                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                        type="button"
                                    >
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
