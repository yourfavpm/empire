import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPayment, getPaymentStatus } from '@/lib/paystack';
import { toNumber } from '@/lib/utils';

// POST /api/payments/paystack/verify - Verify Paystack payment status
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { reference } = body;

        if (!reference) {
            return NextResponse.json(
                { error: 'Payment reference is required' },
                { status: 400 }
            );
        }

        // Find payment
        const { data: payment, error: fetchError } = await supabaseAdmin
            .from('Payment')
            .select(`
                *,
                user:User(*)
            `)
            .eq('reference', reference)
            .single();

        if (fetchError || !payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Check ownership
        if (payment.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // If already verified, return success
        if (payment.status === 'APPROVED' || payment.status === 'VERIFIED') {
            return NextResponse.json({
                message: 'Payment already approved',
                status: 'APPROVED',
            });
        }

        // Verify with Paystack
        const paystackResponse = await verifyPayment(reference);
        const status = getPaymentStatus(paystackResponse.data.status);

        if (status !== 'APPROVED') {
            await supabaseAdmin
                .from('Payment')
                .update({ status })
                .eq('id', payment.id);

            return NextResponse.json({
                message: 'Payment not successful',
                status,
            });
        }

        // Process successful payment using RPC for atomicity
        const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('handle_payment_success', {
            p_reference: reference,
            p_amount: toNumber(payment.amount)
        });

        if (rpcError) {
            console.error('Verify RPC error:', rpcError);
            throw rpcError;
        }

        return NextResponse.json({
            message: 'Payment approved successfully',
            status: 'APPROVED',
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
