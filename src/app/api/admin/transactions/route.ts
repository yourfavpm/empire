import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

// GET /api/admin/transactions - List all transactions (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // CREDIT or DEBIT
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: Record<string, unknown> = {};

        if (type) {
            where.type = type;
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    wallet: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    payment: {
                        select: {
                            type: true,
                            reference: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        return NextResponse.json({
            transactions: transactions.map((tx) => ({
                id: tx.id,
                type: tx.type,
                amount: toNumber(tx.amount),
                description: tx.description,
                balanceAfter: toNumber(tx.balanceAfter),
                createdAt: tx.createdAt,
                user: tx.wallet.user,
                payment: tx.payment,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
