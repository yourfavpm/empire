
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { userId, amount, adminId, reason } = await request.json();

        if (!userId || !amount || !adminId || !reason) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Call the RPC function
        const { error } = await supabaseAdmin.rpc("admin_adjust_wallet", {
            p_user_id: userId,
            p_amount: amount,
            p_admin_id: adminId,
            p_reason: reason,
        });

        if (error) {
            console.error("Error adjusting wallet:", error);
            return NextResponse.json(
                { error: error.message || "Failed to adjust wallet" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: "Wallet adjusted successfully" });
    } catch (error) {
        console.error("Internal error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
