import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

// GET /api/admin/users - List all buyers (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabaseAdmin
            .from('User')
            .select(`
                id,
                email,
                name,
                createdAt,
                wallet:Wallet(balance),
                unlockedAssets:AssetAccess(count),
                payments:Payment(count)
            `, { count: 'exact' })
            .eq('role', 'BUYER');

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: users, count: total, error } = await query
            .order('createdAt', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Get users error:', error);
            throw error;
        }

        return NextResponse.json({
            users: users.map((user: any) => ({
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                walletBalance: user.wallet?.[0] ? toNumber(user.wallet[0].balance) : 0,
                unlockedAssetsCount: user.unlockedAssets?.[0]?.count || 0,
                paymentsCount: user.payments?.[0]?.count || 0,
            })),
            pagination: {
                page,
                limit,
                total: total || 0,
                totalPages: Math.ceil((total || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
