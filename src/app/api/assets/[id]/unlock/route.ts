import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/assets/[id]/unlock - Unlock asset using wallet balance
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get asset
        const asset = await prisma.asset.findUnique({
            where: { id },
        });

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        if (asset.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Asset is not available for purchase' },
                { status: 400 }
            );
        }

        // Check if already unlocked
        const existingAccess = await prisma.assetAccess.findUnique({
            where: {
                userId_assetId: {
                    userId: session.user.id,
                    assetId: id,
                },
            },
        });

        if (existingAccess && !existingAccess.revokedAt) {
            return NextResponse.json(
                { error: 'You already have access to this asset' },
                { status: 400 }
            );
        }

        // Get wallet
        const wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
        });

        if (!wallet) {
            return NextResponse.json(
                { error: 'Wallet not found. Please fund your wallet first.' },
                { status: 400 }
            );
        }

        const walletBalance = toNumber(wallet.balance);
        const assetPrice = toNumber(asset.price);

        if (walletBalance < assetPrice) {
            return NextResponse.json(
                {
                    error: 'Insufficient wallet balance',
                    required: assetPrice,
                    available: walletBalance,
                },
                { status: 400 }
            );
        }

        // Debit wallet and grant access in transaction
        await prisma.$transaction(async (tx) => {
            const newBalance = walletBalance - assetPrice;

            // Debit wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'DEBIT',
                    amount: asset.price,
                    description: `Unlocked asset: ${asset.title}`,
                    assetId: asset.id,
                    balanceAfter: newBalance,
                },
            });

            // Grant access (or reactivate if previously revoked)
            if (existingAccess) {
                await tx.assetAccess.update({
                    where: { id: existingAccess.id },
                    data: {
                        grantedAt: new Date(),
                        revokedAt: null,
                    },
                });
            } else {
                await tx.assetAccess.create({
                    data: {
                        userId: session.user.id,
                        assetId: asset.id,
                    },
                });
            }
        });

        return NextResponse.json({
            message: 'Asset unlocked successfully',
            asset: {
                id: asset.id,
                title: asset.title,
                fullDescription: asset.fullDescription,
                images: asset.images,
                documents: asset.documents,
            },
        });
    } catch (error) {
        console.error('Unlock asset error:', error);
        return NextResponse.json(
            { error: 'Failed to unlock asset' },
            { status: 500 }
        );
    }
}
