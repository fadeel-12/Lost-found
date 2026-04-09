import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { sendMail } from "@/lib/mailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// POST - submit a shipping request for a found item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: itemId } = await params;
  const user = await getCurrentUser();

  const body = await req.json().catch(() => null);
  const { name, email, phone, address_line1, address_line2, city, state, postal_code, country, notes } = body ?? {};

  if (!name || !email || !address_line1 || !city || !postal_code || !country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify the item exists and is a found item
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("id, title, type, user_id, status")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError || !item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.type !== "found") {
    return NextResponse.json({ error: "Shipping requests only apply to found items" }, { status: 400 });
  }

  if (item.status !== "open") {
    return NextResponse.json({ error: "This item is no longer available" }, { status: 400 });
  }

  const { data: request, error } = await supabase
    .from("shipping_requests")
    .insert({
      item_id: itemId,
      requester_user_id: user?.id ?? null,
      requester_name: name,
      requester_email: email,
      requester_phone: phone || null,
      address_line1,
      address_line2: address_line2 || null,
      city,
      state: state || null,
      postal_code,
      country,
      notes: notes || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Shipping request insert error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }

  // Notify the finder by email
  const { data: finder } = await supabase
    .from("users")
    .select("email, name")
    .eq("id", item.user_id)
    .maybeSingle();

  if (finder?.email) {
    await sendMail(
      finder.email,
      `Shipping request for your found item: ${item.title}`,
      `
      <h2>International Shipping Request</h2>
      <p>Hello ${finder.name ?? ""},</p>
      <p>Someone has requested that you ship the found item <strong>${item.title}</strong> to their address.</p>
      <h3>Shipping Details</h3>
      <p><strong>Recipient:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      <p><strong>Address:</strong><br/>
        ${address_line1}${address_line2 ? "<br/>" + address_line2 : ""}<br/>
        ${city}${state ? ", " + state : ""} ${postal_code}<br/>
        ${country}
      </p>
      ${notes ? `<p><strong>Note from requester:</strong> ${notes}</p>` : ""}
      <p>Please log in to the portal to accept or reject this request.</p>
      `
    ).catch((e) => console.error("Mail send error:", e));

    // In-app notification to finder
    await supabase.from("notifications").insert({
      recipient_user_id: item.user_id,
      recipient_email: finder.email,
      notification_type: "system",
      message: JSON.stringify({
        title: "Shipping Request Received",
        text: `${name} has requested international shipping for your found item: ${item.title}`,
        itemId,
        createdAt: new Date().toISOString(),
      }),
      is_read: false,
    }).then(({ error: e }) => { if (e) console.error("Notification insert error:", e); });
  }

  return NextResponse.json(request, { status: 201 });
}

// GET - list shipping requests for an item (finder only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: itemId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Verify caller is the finder (owner of the found item)
  const { data: item } = await supabase
    .from("items")
    .select("user_id")
    .eq("id", itemId)
    .maybeSingle();

  if (!item || item.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("shipping_requests")
    .select("*")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
