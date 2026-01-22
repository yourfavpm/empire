import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/assets/[id]/feature - Toggle featured status
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { featured, featuredOrder } = body;

        // Verify asset exists
        const existingAsset = await prisma.asset.findUnique({
            where: { id },
        });

        if (!existingAsset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        // Update featured status
        const updatedAsset = await prisma.asset.update({
            where: { id },
            data: {
                featured: featured ?? existingAsset.featured,
                featuredOrder: featuredOrder ?? existingAsset.featuredOrder,
            },
        });

        return NextResponse.json({
            message: featured ? 'Asset featured' : 'Asset unfeatured',
            asset: updatedAsset,
        });
    } catch (error) {
        console.error('Toggle feature error:', error);
        return NextResponse.json(
            { error: 'Failed to update asset' },
            { status: 500 }
        );
    }
}
