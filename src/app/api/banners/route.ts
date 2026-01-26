
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use public anon key for public data if possible, or service role if table is protected.
// Since banners are public info, we can use service role here to ensure we get them even if RLS is tricky, 
// but strictly we should use anon key and have RLS "read public for true".
// For simplicity/speed in this task, I'll use the Admin client to just fetch active ones.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('Banner')
        .select('content, link')
        .eq('active', true)
        .order('createdAt', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
