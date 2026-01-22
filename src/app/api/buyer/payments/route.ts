import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

// GET /api/buyer/payments - Get buyer's payment history
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payments = await prisma.payment.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            payments: payments.map((payment) => ({
                ...payment,
                amount: toNumber(payment.amount),
            })),
        });
    } catch (error) {
        console.error('Get payments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
