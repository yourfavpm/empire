import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

// GET /api/admin/stats - Get dashboard statistics (Admin only)
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin.rpc('get_admin_stats');

        if (error) {
            console.error('Get stats RPC error:', error);
            throw error;
        }

        return NextResponse.json({
            stats: {
                totalBuyers: data.totalBuyers,
                totalAssets: data.totalUnits,
                activeAssets: data.availableUnits,
                totalPayments: data.totalPaymentsCount,
                pendingCryptoPayments: data.pendingCryptoPayments,
                totalRevenue: toNumber(data.totalRevenue),
            },
            recentPayments: (data.recentPayments || []).map((p: any) => ({
                ...p,
                amount: toNumber(p.amount),
            })),
            recentUnlocks: (data.recentUnlocks || []).map((a: any) => ({
                id: a.id,
                grantedAt: a.grantedAt,
                user: a.user,
                asset: {
                    title: a.asset.title,
                    price: toNumber(a.asset.price)
                }
            })),
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
