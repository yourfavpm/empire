import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

// GET /api/buyer/assets - Get buyer's unlocked assets
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const unlockedAssets = await prisma.assetAccess.findMany({
            where: {
                userId: session.user.id,
                revokedAt: null,
            },
            include: {
                asset: true,
            },
            orderBy: { grantedAt: 'desc' },
        });

        return NextResponse.json({
            assets: unlockedAssets.map((access) => ({
                id: access.asset.id,
                title: access.asset.title,
                category: access.asset.category,
                platformType: access.asset.platformType,
                price: toNumber(access.asset.price),
                shortDescription: access.asset.shortDescription,
                fullDescription: access.asset.fullDescription,
                images: access.asset.images,
                documents: access.asset.documents,
                unlockedAt: access.grantedAt,
            })),
        });
    } catch (error) {
        console.error('Get unlocked assets error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unlocked assets' },
            { status: 500 }
        );
    }
}
