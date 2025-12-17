import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMail } from "@/lib/mailer";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        date,
        type,
        imageUrl,
        user_id,
        category:categories ( name ),
        location:locations ( name ),
        user:users ( name, email, phone )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = data.map((i: any) => ({
      id: i.id,
      title: i.title,
      category: i.category?.name ?? '',
      status: i.type,
      location: i.location?.name ?? '',
      date: formatDate(i.date),
      imageUrl: i.imageUrl,
      description: i.description,
      contactName: i.user?.name ?? '',
      contactEmail: i.user?.email ?? '',
      contactPhone: i.user?.phone ?? '',
      user_id: i.user_id
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("user_id") as string | null;
    const category_id = formData.get("category_id") as string | null;
    const location_id = formData.get("location_id") as string | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const date = formData.get("date") as string | null;
    const type = formData.get("type") as string | null;
    const status = (formData.get("status") as string | null) ?? "open";
    const file = formData.get("image") as File | null;
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;

    if (
      !user_id ||
      !category_id ||
      !location_id ||
      !title ||
      !description ||
      !date ||
      !type
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (name || email || phone) {
      const updateData: Record<string, any> = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;

      const { error: userUpdateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user_id);

      if (userUpdateError) {
        console.error("User update error:", userUpdateError);
        return NextResponse.json(
          { error: "Failed to update user profile" },
          { status: 500 }
        );
      }
    }

    let imageUrl: string | null = null;

    if (file && file.size > 0) {
      const bucket = "item-images";
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user_id}/${Date.now()}.${ext}`;

      const { data: storageData, error: storageError } =
        await supabase.storage.from(bucket).upload(filePath, file, {
          contentType: file.type,
        });

      if (storageError) {
        console.error("Supabase storage upload error:", storageError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(storageData.path);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data: insertedItem, error: insertError } = await supabase
      .from("items")
      .insert([
        {
          user_id,
          category_id,
          location_id,
          title,
          description,
          date,
          type,
          status,
          imageUrl,
        },
      ])
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }

    const newItem = insertedItem;

    const oppositeType = newItem.type === "lost" ? "found" : "lost";

    const { data: potentialMatches, error: fetchError } = await supabase
      .from("items")
      .select("*")
      .eq("type", oppositeType);

    if (!fetchError && potentialMatches && potentialMatches.length > 0) {
      for (const candidate of potentialMatches) {
        let score = 0;

        if (candidate.category_id === newItem.category_id) {
          score += 0.4;
        }

        const locationScore =
          candidate.location_id === newItem.location_id ? 0.3 : 0;
        score += locationScore;

        const titleSimilarity = computeTitleSimilarity(
          newItem.title,
          candidate.title
        );
        score += titleSimilarity * 0.2;

        const dayDiff =
          Math.abs(
            new Date(newItem.date).getTime() -
            new Date(candidate.date).getTime()
          ) / (1000 * 60 * 60 * 24);

        const dateScore = dayDiff <= 3 ? 0.1 : 0;
        score += dateScore;

        if (score >= 0.5) {

          const lostItemId =
            newItem.type === "lost" ? newItem.id : candidate.id;
          const foundItemId =
            newItem.type === "found" ? newItem.id : candidate.id;

          await supabase.from("matches").insert([
            {
              lost_item_id: lostItemId,
              found_item_id: foundItemId,
              match_score: score,
              location_match_score: locationScore,
            },
          ]);


          const lostUserId =
            newItem.type === "lost" ? newItem.user_id : candidate.user_id;
          const foundUserId =
            newItem.type === "found" ? newItem.user_id : candidate.user_id;

          const { data: lostUser } = await supabase
            .from("users")
            .select("email, name")
            .eq("id", lostUserId)
            .maybeSingle();

          const { data: foundUser } = await supabase
            .from("users")
            .select("email, name")
            .eq("id", foundUserId)
            .maybeSingle();

          if (lostUser?.email) {
            await sendMail(
              lostUser.email,
              "We found a potential match for your lost item",
              `
              <h2>Potential Match Found</h2>
              <p>Hello ${lostUser.name},</p>
              <p>We detected a possible match for your lost item: <strong>${newItem.title}</strong>.</p>
              <p>Please check the Lost & Found portal to verify.</p>
              `
            );
          }

          if (foundUser?.email) {
            await sendMail(
              foundUser.email,
              "Someone may have lost the item you found",
              `
              <h2>Potential Match Found</h2>
              <p>Hello ${foundUser.name},</p>
              <p>Your found item <strong>${candidate.title}</strong> appears to match a lost item reported by another user.</p>
              <p>Please check the Lost & Found portal to verify.</p>
              `
            );
          }
        }
      }
    }

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (err) {
    console.error("POST /api/items error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function computeTitleSimilarity(a: string, b: string) {
  if (!a || !b) return 0;
  a = a.toLowerCase();
  b = b.toLowerCase();
  const wordsA = a.split(" ").filter(Boolean);
  const wordsB = b.split(" ").filter(Boolean);
  const common = wordsA.filter((w) => wordsB.includes(w));
  return common.length / Math.max(wordsA.length, wordsB.length);
}