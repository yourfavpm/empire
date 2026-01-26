
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const session = await auth();

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Call the RPC function we defined in migration
        const { data, error } = await supabaseAdmin.rpc('get_user_referral_stats', {
            p_user_id: userId
        });

        if (error) {
            console.error("RPC Error:", error);
            // Fallback if RPC not exists yet: return 0
            return NextResponse.json({ total_referrals: 0, total_earned: 0 });
        }

        return NextResponse.json(data[0] || { total_referrals: 0, total_earned: 0 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
