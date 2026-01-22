import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

        // Find payment by reference
        const payment = await prisma.payment.findUnique({
            where: { reference },
            include: {
                user: {
                    include: { wallet: true },
                },
            },
        });

        if (!payment) {
            console.warn(`Payment not found for reference: ${reference}`);
            return NextResponse.json({ message: 'Payment not found' });
        }

        // Check if already processed (idempotency)
        if (payment.status === 'VERIFIED') {
            console.log(`Payment already verified: ${reference}`);
            return NextResponse.json({ message: 'Already processed' });
        }

        const status = getPaymentStatus(data.status);

        if (status !== 'VERIFIED') {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status },
            });
            return NextResponse.json({ message: 'Payment status updated' });
        }

        // Process successful payment - update wallet in transaction
        await prisma.$transaction(async (tx) => {
            // Get or create wallet
            let wallet = payment.user.wallet;
            if (!wallet) {
                wallet = await tx.wallet.create({
                    data: { userId: payment.userId, balance: 0 },
                });
            }

            const newBalance = toNumber(wallet.balance) + toNumber(payment.amount);

            // Update wallet balance
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'CREDIT',
                    amount: payment.amount,
                    description: `Wallet funded via Paystack`,
                    paymentId: payment.id,
                    balanceAfter: newBalance,
                },
            });

            // Update payment status
            await tx.payment.update({
                where: { id: payment.id },
                data: { status: 'VERIFIED' },
            });
        });

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
