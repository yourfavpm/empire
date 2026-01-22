import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

// GET /api/admin/users - List all buyers (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: Record<string, unknown> = {
            role: 'BUYER',
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    wallet: {
                        select: {
                            balance: true,
                        },
                    },
                    _count: {
                        select: {
                            unlockedAssets: true,
                            payments: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users: users.map((user) => ({
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                walletBalance: user.wallet ? toNumber(user.wallet.balance) : 0,
                unlockedAssetsCount: user._count.unlockedAssets,
                paymentsCount: user._count.payments,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
