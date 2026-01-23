import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/payments/crypto/[id]/approve - Approve or reject crypto payment (Admin only)
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { action, adminNote } = body;

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Action must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        // Call Supabase RPC for atomic fulfillment
        const { data, error } = await supabaseAdmin.rpc('handle_crypto_approval', {
            p_payment_id: id,
            p_action: action,
            p_admin_note: adminNote
        });

        if (error) {
            console.error('Crypto approval RPC error:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to process payment' },
                { status: 400 }
            );
        }

        if (data.status === 'already_processed') {
            return NextResponse.json(
                { error: 'Payment has already been processed' },
                { status: 400 }
            );
        }

        const message = data.status === 'approved'
            ? 'Payment approved and wallet credited'
            : 'Payment rejected';

        return NextResponse.json({
            message,
            status: data.status.toUpperCase(),
        });
    } catch (error) {
        console.error('Crypto approval error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
}
