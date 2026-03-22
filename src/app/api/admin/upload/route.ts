import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const index = formData.get("index")?.toString() ?? "0";
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `photo-${String(index).padStart(3,"0")}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("cars")
    .upload(`photos/${filename}`, buffer, { contentType: file.type, upsert: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data } = supabase.storage.from("cars").getPublicUrl(`photos/${filename}`);
  return NextResponse.json({ url: data.publicUrl });
}
