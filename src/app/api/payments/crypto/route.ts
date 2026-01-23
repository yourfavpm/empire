import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePaymentReference } from '@/lib/utils';

// POST /api/payments/crypto/submit - Submit crypto payment for approval
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount, cryptoTxId, cryptoNetwork } = body;

        // Validation
        if (!amount || amount < 100) {
            return NextResponse.json(
                { error: 'Minimum amount is ₦100 equivalent' },
                { status: 400 }
            );
        }

        if (!cryptoTxId || cryptoTxId.trim().length < 10) {
            return NextResponse.json(
                { error: 'Valid transaction ID (TXID) is required' },
                { status: 400 }
            );
        }

        if (!cryptoNetwork) {
            return NextResponse.json(
                { error: 'Crypto network is required' },
                { status: 400 }
            );
        }

        const validNetworks = ['BTC', 'ETH', 'USDT-TRC20', 'USDT-ERC20'];
        if (!validNetworks.includes(cryptoNetwork)) {
            return NextResponse.json(
                { error: `Invalid network. Supported: ${validNetworks.join(', ')}` },
                { status: 400 }
            );
        }

        // Check for duplicate TXID
        const { data: existingPayment, error: fetchError } = await supabaseAdmin
            .from('Payment')
            .select('id')
            .eq('cryptoTxId', cryptoTxId.trim())
            .maybeSingle();

        if (existingPayment) {
            return NextResponse.json(
                { error: 'This transaction ID has already been submitted' },
                { status: 409 }
            );
        }

        // Generate unique reference
        const reference = generatePaymentReference();

        // Get crypto address from environment
        const cryptoAddresses: Record<string, string> = {
            'BTC': process.env.CRYPTO_BTC_ADDRESS || '',
            'ETH': process.env.CRYPTO_ETH_ADDRESS || '',
            'USDT-TRC20': process.env.CRYPTO_USDT_TRC20_ADDRESS || '',
            'USDT-ERC20': process.env.CRYPTO_ETH_ADDRESS || '',
        };

        // Create pending payment
        const { data: payment, error: createError } = await supabaseAdmin
            .from('Payment')
            .insert({
                userId: session.user.id,
                amount,
                type: 'CRYPTO',
                status: 'PENDING',
                reference,
                cryptoTxId: cryptoTxId.trim(),
                cryptoNetwork,
                cryptoAddress: cryptoAddresses[cryptoNetwork],
            })
            .select()
            .single();

        if (createError) {
            console.error('Crypto create payment error:', createError);
            throw createError;
        }

        return NextResponse.json({
            message: 'Crypto payment submitted for approval',
            reference: payment.reference,
            status: 'PENDING',
        });
    } catch (error) {
        console.error('Crypto submit error:', error);
        return NextResponse.json(
            { error: 'Failed to submit payment' },
            { status: 500 }
        );
    }
}

// GET /api/payments/crypto/info - Get crypto wallet addresses for payment
export async function GET() {
    try {
        // Default crypto networks - always show these options
        const networks = [
            {
                network: 'BTC',
                address: process.env.CRYPTO_BTC_ADDRESS || 'Contact admin for address',
                available: !!process.env.CRYPTO_BTC_ADDRESS
            },
            {
                network: 'ETH',
                address: process.env.CRYPTO_ETH_ADDRESS || 'Contact admin for address',
                available: !!process.env.CRYPTO_ETH_ADDRESS
            },
            {
                network: 'USDT-TRC20',
                address: process.env.CRYPTO_USDT_TRC20_ADDRESS || 'Contact admin for address',
                available: !!process.env.CRYPTO_USDT_TRC20_ADDRESS
            },
        ];

        return NextResponse.json({
            addresses: networks,
            instructions: [
                'Select your preferred cryptocurrency',
                'Send the exact amount to the provided wallet address',
                'Copy the transaction ID (TXID) after sending',
                'Submit the TXID for admin approval',
                'Your wallet will be credited once approved',
            ],
        });
    } catch (error) {
        console.error('Get crypto info error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch crypto info' },
            { status: 500 }
        );
    }
}
