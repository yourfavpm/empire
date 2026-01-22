import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
        const payment = await prisma.payment.findUnique({
            where: { reference },
            include: {
                user: {
                    include: { wallet: true },
                },
            },
        });

        if (!payment) {
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
        if (payment.status === 'VERIFIED') {
            return NextResponse.json({
                message: 'Payment already verified',
                status: 'VERIFIED',
            });
        }

        // Verify with Paystack
        const paystackResponse = await verifyPayment(reference);
        const status = getPaymentStatus(paystackResponse.data.status);

        if (status !== 'VERIFIED') {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status },
            });

            return NextResponse.json({
                message: 'Payment not successful',
                status,
            });
        }

        // Process successful payment
        await prisma.$transaction(async (tx) => {
            let wallet = payment.user.wallet;
            if (!wallet) {
                wallet = await tx.wallet.create({
                    data: { userId: payment.userId, balance: 0 },
                });
            }

            const newBalance = toNumber(wallet.balance) + toNumber(payment.amount);

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'CREDIT',
                    amount: payment.amount,
                    description: 'Wallet funded via Paystack',
                    paymentId: payment.id,
                    balanceAfter: newBalance,
                },
            });

            await tx.payment.update({
                where: { id: payment.id },
                data: { status: 'VERIFIED' },
            });
        });

        return NextResponse.json({
            message: 'Payment verified successfully',
            status: 'VERIFIED',
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
