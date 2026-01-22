import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

// GET /api/admin/payments - List all payments (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // PAYSTACK or CRYPTO
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: Record<string, unknown> = {};

        if (type) {
            where.type = type;
        }

        if (status) {
            where.status = status;
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.payment.count({ where }),
        ]);

        // Get pending crypto count
        const pendingCryptoCount = await prisma.payment.count({
            where: {
                type: 'CRYPTO',
                status: 'PENDING',
            },
        });

        return NextResponse.json({
            payments: payments.map((payment) => ({
                ...payment,
                amount: toNumber(payment.amount),
            })),
            pendingCryptoCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get payments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
