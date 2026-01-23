import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateWebhookSignature, getPaymentStatus } from '@/lib/paystack';
import { toNumber } from '@/lib/utils';

// POST /api/payments/paystack/webhook - Handle Paystack webhook
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-paystack-signature') || '';

        // Validate webhook signature
        if (!validateWebhookSignature(body, signature)) {
            console.warn('Invalid Paystack webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);

        // Only process charge.success events
        if (event.event !== 'charge.success') {
            return NextResponse.json({ message: 'Event ignored' });
        }

        const data = event.data;
        const reference = data.reference;
        const amount = data.amount / 100; // Paystack amount is in kobo

        // Call Supabase RPC for atomic fulfillment
        const { data: rpcData, error } = await supabaseAdmin.rpc('handle_payment_success', {
            p_reference: reference,
            p_amount: amount
        });

        if (error) {
            console.error('Webhook RPC error:', error);
            // If payment wasn't found in our DB, RPC might fail
            return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 400 });
        }

        if (rpcData.status === 'already_processed') {
            return NextResponse.json({ message: 'Already processed' });
        }

        console.log(`Payment verified and wallet credited: ${reference}`);
        return NextResponse.json({ message: 'Payment verified' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
