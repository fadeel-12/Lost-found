import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { sendMail } from "@/lib/mailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// PATCH - accept/reject a shipping request, or add tracking number
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Fetch the request to verify ownership
  const { data: shippingReq } = await supabase
    .from("shipping_requests")
    .select("*, items(user_id, title)")
    .eq("id", id)
    .maybeSingle();

  if (!shippingReq) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((shippingReq.items as any).user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { status, tracking_number } = body ?? {};

  const allowed = ["accepted", "shipped", "delivered", "rejected"];
  if (status && !allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const update: Record<string, any> = {};
  if (status) update.status = status;
  if (tracking_number !== undefined) update.tracking_number = tracking_number || null;

  const { data: updated, error } = await supabase
    .from("shipping_requests")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const itemTitle = (shippingReq.items as any).title;

  // Notify the requester by email on status changes
  if (status && shippingReq.requester_email) {
    const statusMessages: Record<string, string> = {
      accepted: `Great news! The finder has accepted your shipping request for "${itemTitle}". They will ship the item to your address soon.`,
      shipped: `Your item "${itemTitle}" has been shipped!${tracking_number ? ` Tracking number: <strong>${tracking_number}</strong>` : ""}`,
      delivered: `Your item "${itemTitle}" has been marked as delivered. We hope everything went well!`,
      rejected: `Unfortunately, the finder was unable to process your shipping request for "${itemTitle}". Please contact the finder directly for more information.`,
    };

    const msg = statusMessages[status];
    if (msg) {
      await sendMail(
        shippingReq.requester_email,
        `Shipping update for: ${itemTitle}`,
        `<h2>Shipping Request Update</h2><p>Hello ${shippingReq.requester_name},</p><p>${msg}</p>`
      ).catch((e) => console.error("Mail send error:", e));
    }
  }

  return NextResponse.json(updated);
}
