import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/assets/unlock-batch
// Request body: { purchases: [{ subcategoryId: string, quantity: number }] }
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { purchases } = body;

        if (!purchases || !Array.isArray(purchases) || purchases.length === 0) {
            return NextResponse.json({ error: 'No items selected' }, { status: 400 });
        }

        // Call the Supabase RPC for atomic transaction
        const { data, error } = await supabaseAdmin.rpc('process_purchase', {
            p_user_id: session.user.id,
            p_purchases: purchases
        });

        if (error) {
            console.error('Batch unlock RPC error:', error);
            // Supabase RPC errors might contain the custom message from RAISE EXCEPTION
            return NextResponse.json({
                error: error.message || 'Failed to process purchase'
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Purchase successful',
            orderId: data.orderId,
            count: data.unitCount
        });

    } catch (error: any) {
        console.error('Batch unlock error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to process purchase'
        }, { status: 500 });
    }
}
