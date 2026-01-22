import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

// GET /api/admin/stats - Get dashboard statistics (Admin only)
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get various counts and sums
        const [
            totalBuyers,
            totalAssets,
            activeAssets,
            totalPayments,
            pendingCryptoPayments,
            totalRevenue,
            recentPayments,
            recentUnlocks,
        ] = await Promise.all([
            // Total buyers
            prisma.user.count({ where: { role: 'BUYER' } }),
            // Total assets
            prisma.asset.count(),
            // Active assets
            prisma.asset.count({ where: { status: 'ACTIVE' } }),
            // Total payments
            prisma.payment.count({ where: { status: { in: ['VERIFIED', 'APPROVED'] } } }),
            // Pending crypto payments
            prisma.payment.count({ where: { type: 'CRYPTO', status: 'PENDING' } }),
            // Total revenue (sum of verified/approved payments)
            prisma.payment.aggregate({
                where: { status: { in: ['VERIFIED', 'APPROVED'] } },
                _sum: { amount: true },
            }),
            // Recent payments (last 5)
            prisma.payment.findMany({
                where: { status: { in: ['VERIFIED', 'APPROVED'] } },
                include: {
                    user: {
                        select: { name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            // Recent unlocks (last 5)
            prisma.assetAccess.findMany({
                include: {
                    user: {
                        select: { name: true },
                    },
                    asset: {
                        select: { title: true, price: true },
                    },
                },
                orderBy: { grantedAt: 'desc' },
                take: 5,
            }),
        ]);

        return NextResponse.json({
            stats: {
                totalBuyers,
                totalAssets,
                activeAssets,
                totalPayments,
                pendingCryptoPayments,
                totalRevenue: totalRevenue._sum.amount
                    ? toNumber(totalRevenue._sum.amount)
                    : 0,
            },
            recentPayments: recentPayments.map((p) => ({
                ...p,
                amount: toNumber(p.amount),
            })),
            recentUnlocks: recentUnlocks.map((a) => ({
                ...a,
                asset: {
                    ...a.asset,
                    price: toNumber(a.asset.price),
                },
            })),
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
