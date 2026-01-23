import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

// GET /api/admin/payments - List all payments (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // PAYSTACK or CRYPTO
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabaseAdmin
            .from('Payment')
            .select(`
                *,
                user:User(id, name, email)
            `, { count: 'exact' });

        if (type) {
            query = query.eq('type', type);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const [results, pendingCrypto] = await Promise.all([
            query.order('createdAt', { ascending: false }).range(from, to),
            supabaseAdmin
                .from('Payment')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'CRYPTO')
                .eq('status', 'PENDING')
        ]);

        if (results.error) {
            console.error('Get payments error:', results.error);
            throw results.error;
        }

        return NextResponse.json({
            payments: (results.data || []).map((payment: any) => ({
                ...payment,
                amount: toNumber(payment.amount),
            })),
            pendingCryptoCount: pendingCrypto.count || 0,
            pagination: {
                page,
                limit,
                total: results.count || 0,
                totalPages: Math.ceil((results.count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Get payments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
