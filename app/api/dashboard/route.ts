import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Run all queries in parallel
  const [itemsRes, qrTagsRes, notifRes] = await Promise.all([
    supabase
      .from("items")
      .select(`
        id, title, description, type, status, date, imageUrl, is_pet, pet_name, species,
        category:categories ( name ),
        location:locations ( name )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("qr_tags")
      .select("id, label, status, is_pet, microchip, created_at, expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_user_id", user.id)
      .eq("is_read", false),
  ]);

  const items = (itemsRes.data ?? []).map((i: any) => ({
    id: i.id,
    title: i.title,
    type: i.type as "lost" | "found",
    status: i.status as "open" | "recovered" | "deleted",
    date: i.date
      ? new Date(i.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    imageUrl: i.imageUrl ?? null,
    is_pet: i.is_pet ?? false,
    pet_name: i.pet_name ?? null,
    species: i.species ?? null,
    category: i.category?.name ?? "",
    location: i.location?.name ?? "",
  }));

  const now = new Date();
  const qrTags = (qrTagsRes.data ?? []).map((t: any) => {
    // Lazily reflect expiry in dashboard response
    const isExpired =
      t.status === "expired" ||
      (t.status === "active" && t.expires_at && new Date(t.expires_at) < now);
    return {
      id: t.id,
      label: t.label,
      status: (isExpired ? "expired" : t.status) as "pending_payment" | "active" | "deactivated" | "expired",
      is_pet: t.is_pet ?? false,
      microchip: t.microchip ?? null,
      created_at: t.created_at,
      expires_at: t.expires_at ?? null,
    };
  });

  // Fetch match counts for user's items
  const itemIds = items.map((i) => i.id);
  let matchCount = 0;
  if (itemIds.length > 0) {
    const orFilter = itemIds
      .map((id) => `lost_item_id.eq.${id},found_item_id.eq.${id}`)
      .join(",");
    const { count } = await supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .or(orFilter);
    matchCount = count ?? 0;
  }

  // Stats
  const stats = {
    totalItems: items.length,
    lostOpen: items.filter((i) => i.type === "lost" && i.status === "open").length,
    foundOpen: items.filter((i) => i.type === "found" && i.status === "open").length,
    recovered: items.filter((i) => i.status === "recovered").length,
    petItems: items.filter((i) => i.is_pet).length,
    qrActive: qrTags.filter((t) => t.status === "active").length,
    qrPending: qrTags.filter((t) => t.status === "pending_payment").length,
    qrExpired: qrTags.filter((t) => t.status === "expired").length,
    matchCount,
    unreadNotifications: notifRes.count ?? 0,
  };

  return NextResponse.json({
    user: { name: user.name, email: user.email },
    stats,
    items,
    qrTags,
  });
}
