"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "@/components/dialogs/EditProfileDialog";
import type { UserItem } from "@/components/dialogs/MyItemsDialog";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    avatarUrl: "",
  });

  const [lostItems, setLostItems] = useState<UserItem[]>([]);
  const [foundItems, setFoundItems] = useState<UserItem[]>([]);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    const res = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "include",
    });

    const json = await safeJson(res);

    if (res.ok && json?.user) {
      setProfile({
        name: json.user?.name ?? "",
        email: json.user?.email ?? "",
        phone: json.user?.phone ?? "",
        studentId: json.user?.student_id ?? "",
        avatarUrl: json.user?.avatar_url ?? "",
      });
    }
  }, [userId]);


  const updateProfile = useCallback(async (next: UserProfile) => {
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: next.name,
        phone: next.phone,
        studentId: next.studentId,
        avatarUrl: next.avatarUrl ?? null,
      }),
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(json?.error ?? "Failed to update profile");

    setProfile(next);
  }, []);

  const fetchMyItems = useCallback(async () => {
    if (!userId) return;
    const res = await fetch("/api/auth/me/items", { cache: "no-store", credentials: "include" });
    const json = await safeJson(res);
    if (res.ok) {
      setLostItems(Array.isArray(json?.lostItems) ? json.lostItems : []);
      setFoundItems(Array.isArray(json?.foundItems) ? json.foundItems : []);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId, fetchProfile]);

  return {
    profile,
    setProfile,
    fetchProfile,
    updateProfile,
    lostItems,
    foundItems,
    fetchMyItems,
  };
}
