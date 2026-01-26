
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Fetch User
        const { data: user, error: userError } = await supabaseAdmin
            .from("User")
            .select("*")
            .eq("id", id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch Wallet
        const { data: wallet } = await supabaseAdmin
            .from("Wallet")
            .select("balance")
            .eq("userId", id)
            .single();

        // Fetch Transactions
        const { data: transactions } = await supabaseAdmin
            .from("Transaction")
            .select("*")
            .eq("userId", id)
            .order("createdAt", { ascending: false })
            .limit(50);

        return NextResponse.json({
            user: { ...user, balance: wallet?.balance || 0 },
            transactions: transactions || []
        });

    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Check if user has transactions or assets
    // Since we have ON DELETE CASCADE in schema, we can just delete from User table
    // But safely we might want to check permissions or soft delete.
    // Schema says ON DELETE CASCADE for Wallet, etc. So hard delete is supported by DB.

    const { error } = await supabaseAdmin.from("User").delete().eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
