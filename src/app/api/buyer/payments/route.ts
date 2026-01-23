import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

// GET /api/buyer/payments - Get buyer's payment history
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: payments, error } = await supabaseAdmin
            .from('Payment')
            .select('*')
            .eq('userId', session.user.id)
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Get payments error:', error);
            throw error;
        }

        return NextResponse.json({
            payments: (payments || []).map((payment: any) => ({
                ...payment,
                amount: toNumber(payment.amount),
            })),
        });
    } catch (error) {
        console.error('Get payments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
