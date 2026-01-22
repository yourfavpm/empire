import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/assets/[id] - Get single asset (locked fields only if unlocked)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;

        const asset = await prisma.asset.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { unlockedBy: true },
                },
            },
        });

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        // Check if user is admin or has unlocked this asset
        const isAdmin = session?.user?.role === 'ADMIN';
        let isUnlocked = false;

        if (session?.user?.id && !isAdmin) {
            const access = await prisma.assetAccess.findUnique({
                where: {
                    userId_assetId: {
                        userId: session.user.id,
                        assetId: id,
                    },
                },
            });
            isUnlocked = !!access && !access.revokedAt;
        }

        // Restrict access to non-active assets for non-admins
        if (!isAdmin && asset.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        // Return full or partial data based on access
        const canViewLocked = isAdmin || isUnlocked;

        return NextResponse.json({
            asset: {
                id: asset.id,
                title: asset.title,
                category: asset.category,
                platformType: asset.platformType,
                price: toNumber(asset.price),
                shortDescription: asset.shortDescription,
                status: asset.status,
                createdAt: asset.createdAt,
                unlockCount: asset._count.unlockedBy,
                isUnlocked,
                // Locked fields
                fullDescription: canViewLocked ? asset.fullDescription : null,
                images: canViewLocked ? asset.images : asset.images.slice(0, 1), // Only first image for preview
                documents: canViewLocked ? asset.documents : [],
            },
        });
    } catch (error) {
        console.error('Get asset error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch asset' },
            { status: 500 }
        );
    }
}

// PATCH /api/assets/[id] - Update asset (Admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const existingAsset = await prisma.asset.findUnique({
            where: { id },
        });

        if (!existingAsset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        const asset = await prisma.asset.update({
            where: { id },
            data: {
                title: body.title,
                category: body.category,
                platformType: body.platformType,
                price: body.price,
                shortDescription: body.shortDescription,
                fullDescription: body.fullDescription,
                images: body.images,
                documents: body.documents,
                status: body.status,
            },
        });

        return NextResponse.json({
            message: 'Asset updated successfully',
            asset: {
                ...asset,
                price: toNumber(asset.price),
            },
        });
    } catch (error) {
        console.error('Update asset error:', error);
        return NextResponse.json(
            { error: 'Failed to update asset' },
            { status: 500 }
        );
    }
}

// DELETE /api/assets/[id] - Delete asset (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const existingAsset = await prisma.asset.findUnique({
            where: { id },
        });

        if (!existingAsset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        await prisma.asset.delete({
            where: { id },
        });

        return NextResponse.json({
            message: 'Asset deleted successfully',
        });
    } catch (error) {
        console.error('Delete asset error:', error);
        return NextResponse.json(
            { error: 'Failed to delete asset' },
            { status: 500 }
        );
    }
}
