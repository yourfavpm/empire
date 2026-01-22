import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { initializePayment } from '@/lib/paystack';
import { generatePaymentReference } from '@/lib/utils';

// POST /api/payments/paystack/init - Initialize Paystack payment
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount } = body;

        // Validation
        if (!amount || amount < 100) {
            return NextResponse.json(
                { error: 'Minimum amount is ₦100' },
                { status: 400 }
            );
        }

        if (amount > 10000000) {
            return NextResponse.json(
                { error: 'Maximum amount is ₦10,000,000' },
                { status: 400 }
            );
        }

        // Generate unique reference
        const reference = generatePaymentReference();

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                amount,
                type: 'PAYSTACK',
                status: 'PENDING',
                reference,
            },
        });

        // Initialize Paystack payment
        const paystackResponse = await initializePayment(
            session.user.email,
            amount,
            reference,
            {
                userId: session.user.id,
                paymentId: payment.id,
            }
        );

        // Update payment with Paystack reference
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                paystackRef: paystackResponse.data.reference,
            },
        });

        return NextResponse.json({
            message: 'Payment initialized',
            authorizationUrl: paystackResponse.data.authorization_url,
            reference: payment.reference,
            accessCode: paystackResponse.data.access_code,
        });
    } catch (error) {
        console.error('Paystack init error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize payment' },
            { status: 500 }
        );
    }
}
