import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

// GET /api/assets - List assets (public: active only, admin: all)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const isAdmin = session?.user?.role === 'ADMIN';

        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const platform = searchParams.get('platform');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');

        const where: Record<string, unknown> = {};

        // Non-admins can only see active assets
        if (!isAdmin) {
            where.status = 'ACTIVE';
        } else if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        if (platform) {
            where.platformType = platform;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [assets, total] = await Promise.all([
            prisma.asset.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    category: true,
                    platformType: true,
                    price: true,
                    shortDescription: true,
                    images: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: { unlockedBy: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.asset.count({ where }),
        ]);

        // Get user's unlocked assets if logged in
        let unlockedAssetIds: string[] = [];
        if (session?.user?.id) {
            const unlockedAssets = await prisma.assetAccess.findMany({
                where: {
                    userId: session.user.id,
                    revokedAt: null,
                },
                select: { assetId: true },
            });
            unlockedAssetIds = unlockedAssets.map((a) => a.assetId);
        }

        return NextResponse.json({
            assets: assets.map((asset) => ({
                ...asset,
                price: toNumber(asset.price),
                isUnlocked: unlockedAssetIds.includes(asset.id),
                unlockCount: asset._count.unlockedBy,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get assets error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assets' },
            { status: 500 }
        );
    }
}

// POST /api/assets - Create asset (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            category,
            platformType,
            price,
            shortDescription,
            fullDescription,
            images = [],
            documents = [],
            status = 'DRAFT',
        } = body;

        // Validation
        if (!title || !category || !platformType || !price || !shortDescription || !fullDescription) {
            return NextResponse.json(
                { error: 'Title, category, platform, price, and descriptions are required' },
                { status: 400 }
            );
        }

        if (price < 0) {
            return NextResponse.json(
                { error: 'Price must be positive' },
                { status: 400 }
            );
        }

        const asset = await prisma.asset.create({
            data: {
                title,
                category,
                platformType,
                price,
                shortDescription,
                fullDescription,
                images,
                documents,
                status,
            },
        });

        return NextResponse.json({
            message: 'Asset created successfully',
            asset: {
                ...asset,
                price: toNumber(asset.price),
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create asset error:', error);
        return NextResponse.json(
            { error: 'Failed to create asset' },
            { status: 500 }
        );
    }
}
