import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

// GET /api/admin/transactions - List all transactions (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // CREDIT or DEBIT
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabaseAdmin
            .from('Transaction')
            .select(`
                *,
                wallet:Wallet(
                    user:User(id, name, email)
                ),
                payment:Payment(type, reference)
            `, { count: 'exact' });

        if (type) {
            query = query.eq('type', type);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: transactions, count: total, error } = await query
            .order('createdAt', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Get transactions error:', error);
            throw error;
        }

        return NextResponse.json({
            transactions: (transactions || []).map((tx: any) => ({
                id: tx.id,
                type: tx.type,
                amount: toNumber(tx.amount),
                description: tx.description,
                balanceAfter: toNumber(tx.balanceAfter),
                createdAt: tx.createdAt,
                user: tx.wallet?.user || null,
                payment: tx.payment,
            })),
            pagination: {
                page,
                limit,
                total: total || 0,
                totalPages: Math.ceil((total || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
