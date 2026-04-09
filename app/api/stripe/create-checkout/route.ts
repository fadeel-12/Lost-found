import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/getCurrentUser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const ITEM_TAG_CENTS = 100;   // €1.00 per regular item QR tag
const PET_TAG_CENTS  = 1000;  // €10.00 per pet QR tag

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tagIds: string[] = Array.isArray(body?.tagIds) ? body.tagIds : [];

  if (tagIds.length === 0) {
    return NextResponse.json({ error: "No tags selected" }, { status: 400 });
  }

  // Verify all tags belong to the user and are pending_payment; fetch is_pet
  const { data: tags, error } = await supabase
    .from("qr_tags")
    .select("id, label, is_pet")
    .in("id", tagIds)
    .eq("user_id", user.id)
    .eq("status", "pending_payment");

  if (error || !tags || tags.length === 0) {
    return NextResponse.json({ error: "No valid pending tags found" }, { status: 400 });
  }

  const validIds = tags.map((t) => t.id);
  const petTags  = tags.filter((t) => t.is_pet);
  const itemTags = tags.filter((t) => !t.is_pet);
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Build line items — one row per tag type present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineItems: any[] = [];

  if (itemTags.length > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: `QR Tag${itemTags.length > 1 ? "s" : ""} (Item) × ${itemTags.length}`,
          description: "Scan-to-notify QR tag for valuables — €1.00 each, valid 6 months",
        },
        unit_amount: ITEM_TAG_CENTS,
      },
      quantity: itemTags.length,
    });
  }

  if (petTags.length > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: `🐾 Pet QR Tag${petTags.length > 1 ? "s" : ""} × ${petTags.length}`,
          description: "Durable pet ID tag with owner-contact QR code — €10.00 each",
        },
        unit_amount: PET_TAG_CENTS,
      },
      quantity: petTags.length,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    metadata: {
      user_id: user.id,
      tag_ids: validIds.join(","),
    },
    success_url: `${appUrl}/qr-payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/?qr_tags=open`,
  });

  return NextResponse.json({ url: session.url });
}
