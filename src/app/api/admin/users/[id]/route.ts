import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id] - Get single user details (Admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                wallet: {
                    include: {
                        transactions: {
                            orderBy: { createdAt: 'desc' },
                            take: 20,
                        },
                    },
                },
                unlockedAssets: {
                    include: {
                        asset: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                            },
                        },
                    },
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                wallet: user.wallet
                    ? {
                        balance: toNumber(user.wallet.balance),
                        transactions: user.wallet.transactions.map((tx) => ({
                            ...tx,
                            amount: toNumber(tx.amount),
                            balanceAfter: toNumber(tx.balanceAfter),
                        })),
                    }
                    : null,
                unlockedAssets: user.unlockedAssets.map((access) => ({
                    ...access,
                    asset: {
                        ...access.asset,
                        price: toNumber(access.asset.price),
                    },
                })),
                payments: user.payments.map((payment) => ({
                    ...payment,
                    amount: toNumber(payment.amount),
                })),
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete user (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Cannot delete admin users' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
