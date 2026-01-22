import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

// GET /api/wallet - Get current user's wallet
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!wallet) {
            // Create wallet if it doesn't exist
            const newWallet = await prisma.wallet.create({
                data: {
                    userId: session.user.id,
                    balance: 0,
                },
                include: {
                    transactions: true,
                },
            });

            return NextResponse.json({
                balance: 0,
                transactions: [],
                wallet: newWallet,
            });
        }

        return NextResponse.json({
            balance: toNumber(wallet.balance),
            transactions: wallet.transactions.map((tx) => ({
                ...tx,
                amount: toNumber(tx.amount),
                balanceAfter: toNumber(tx.balanceAfter),
            })),
            wallet: {
                id: wallet.id,
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt,
            },
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet' },
            { status: 500 }
        );
    }
}
