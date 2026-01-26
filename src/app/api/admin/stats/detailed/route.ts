
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const { data: metricsData, error: metricsError } = await supabaseAdmin.rpc("get_admin_daily_stats");
        if (metricsError) throw metricsError;

        const { data: customersData, error: customersError } = await supabaseAdmin.rpc("get_top_customers");
        if (customersError) throw customersError;

        const metrics = metricsData[0] || {};

        // Map to frontend expected format + new daily stats
        const payload = {
            totalUsers: Number(metrics.total_users || 0),
            totalBlockedUsers: Number(metrics.total_blocked_users || 0),
            totalRevenue: Number(metrics.total_revenue || 0),
            totalWalletRecharge: Number(metrics.total_wallet_recharge || 0),
            newUsersToday: Number(metrics.new_users_today || 0),
            rechargedToday: Number(metrics.recharged_today || 0),
            revenueToday: Number(metrics.revenue_today || 0),
            topCustomers: customersData || []
        };

        return NextResponse.json(payload);
    } catch (error) {
        console.error("Internal API error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
