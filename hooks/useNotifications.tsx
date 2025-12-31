"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { AppNotification } from "@/components/home/NotificationsPanel";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function safeJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export function useNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const pollingRef = useRef<number | null>(null);

    const enabled = useMemo(() => !!userId, [userId]);

    const fetchNotifications = useCallback(async () => {
        if (!enabled) {
            setNotifications([]);
            return;
        }
        try {
            const res = await fetch("/api/notifications", {
                cache: "no-store",
                credentials: "include",
            });
            const json = await safeJson(res);
            setNotifications(Array.isArray(json?.notifications) ? json.notifications : []);
        } catch (e) {
            console.error("fetch notifications error", e);
        }
    }, [enabled]);

    const markAsRead = useCallback(
        async (id: string) => {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );

            try {
                const res = await fetch(`/api/notifications/${id}`, {
                    method: "PATCH",
                    credentials: "include",
                });

                if (!res.ok) {
                    const body = await safeJson(res);
                    throw new Error(body?.error ?? `PATCH failed: ${res.status}`);
                }

                fetchNotifications();
            } catch (e) {
                console.error("markAsRead failed", e);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: false } : n))
                );
            }
        },
        [fetchNotifications]
    );

    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        try {
            const res = await fetch("/api/notifications/mark-all-read", {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                const body = await safeJson(res);
                throw new Error(body?.error ?? `mark-all failed: ${res.status}`);
            }

            fetchNotifications();
        } catch (e) {
            console.error("markAllAsRead failed", e);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const deleteNotification = useCallback(
        async (id: string) => {
            const before = notifications;

            setNotifications((prev) => prev.filter((n) => n.id !== id));

            try {
                const res = await fetch(`/api/notifications/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (!res.ok) {
                    const body = await safeJson(res);
                    throw new Error(body?.error ?? `DELETE failed: ${res.status}`);
                }

                fetchNotifications();
            } catch (e) {
                console.error("deleteNotification failed", e);
                setNotifications(before);
            }
        },
        [notifications, fetchNotifications]
    );

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!enabled) return;

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `recipient_user_id=eq.${userId}`,
                },
                () => fetchNotifications()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [enabled, userId, fetchNotifications]);

    useEffect(() => {
        if (!enabled) return;

        pollingRef.current = window.setInterval(fetchNotifications, 10000);
        return () => {
            if (pollingRef.current) window.clearInterval(pollingRef.current);
            pollingRef.current = null;
        };
    }, [enabled, fetchNotifications]);

    return {
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };
}
