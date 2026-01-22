import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

        // Find payment
        const payment = await prisma.payment.findUnique({
            where: { id },
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

        if (payment.type !== 'CRYPTO') {
            return NextResponse.json(
                { error: 'Only crypto payments can be manually approved' },
                { status: 400 }
            );
        }

        if (payment.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Payment has already been processed' },
                { status: 400 }
            );
        }

        if (action === 'reject') {
            await prisma.payment.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    adminNote: adminNote || 'Payment rejected by admin',
                },
            });

            return NextResponse.json({
                message: 'Payment rejected',
                status: 'REJECTED',
            });
        }

        // Approve - credit wallet in transaction
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
                    description: `Wallet funded via Crypto (${payment.cryptoNetwork})`,
                    paymentId: payment.id,
                    balanceAfter: newBalance,
                },
            });

            await tx.payment.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    adminNote: adminNote || 'Payment approved by admin',
                },
            });
        });

        return NextResponse.json({
            message: 'Payment approved and wallet credited',
            status: 'APPROVED',
        });
    } catch (error) {
        console.error('Crypto approval error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
}
