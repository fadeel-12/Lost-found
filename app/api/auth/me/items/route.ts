import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("items")
    .select(`
      id,
      title,
      description,
      date,
      type,
      imageUrl,
      status,
      category:categories ( name ),
      location:locations ( name ),
      user:users ( id, name, email, phone )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }

  const mapped = (data ?? []).map((i: any) => ({
    id: i.id,
    title: i.title ?? "",
    category: i.category?.name ?? "",
    type: i.type as "lost" | "found",
    location: i.location?.name ?? "",
    date: i.date ? formatDate(i.date) : "",
    imageUrl: i.imageUrl ?? "",
    description: i.description ?? "",
    contactName: i.user?.name ?? '',
    contactEmail: i.user?.email ?? '',
    contactPhone: i.user?.phone ?? '',
    user_id: i.user?.id,
    status: i.status
  }));

  return NextResponse.json({
    lostItems: mapped.filter((x) => x.type === "lost"),
    foundItems: mapped.filter((x) => x.type === "found"),
  });
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const itemId = String(body?.itemId ?? "").trim();
    const status = String(body?.status ?? "").trim() as "deleted" | "recovered";

    if (!itemId || !status) {
      return NextResponse.json({ error: "itemId and status are required" }, { status: 400 });
    }
    if (!["deleted", "recovered"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { data: item, error: itemErr } = await supabase
      .from("items")
      .select("id, title, status, user_id, type")
      .eq("id", itemId)
      .maybeSingle();

    if (itemErr || !item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (item.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { error: updateErr } = await supabase
      .from("items")
      .update({ status })
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update item status" }, { status: 500 });
    }

    if (status === "recovered") {
      const { data: me, error: meErr } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", user.id)
        .maybeSingle();

      if (!meErr && me) {
        await supabase.from("notifications").insert([
          {
            recipient_user_id: user.id,
            recipient_email: me.email,
            notification_type: "item_claimed",
            message: JSON.stringify({
              title: "Item marked as recovered",
              text: `You marked "${item.title}" as recovered.`,
              itemId: item.id,
              createdAt: new Date().toISOString(),
            }),
            is_sent: true,
            is_read: false,
          },
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Item marked as ${status}`,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
