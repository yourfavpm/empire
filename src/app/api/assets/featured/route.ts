import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/assets/featured - Get featured assets grouped by category
export async function GET(req: NextRequest) {
    try {
        // Get all featured assets that are active
        const featuredAssets = await prisma.asset.findMany({
            where: {
                featured: true,
                status: 'ACTIVE',
            },
            orderBy: [
                { category: 'asc' },
                { featuredOrder: 'asc' },
            ],
            select: {
                id: true,
                title: true,
                category: true,
                platformType: true,
                price: true,
                shortDescription: true,
                images: true,
            },
        });

        // Group by category
        const groupedAssets: Record<string, typeof featuredAssets> = {};

        for (const asset of featuredAssets) {
            if (!groupedAssets[asset.category]) {
                groupedAssets[asset.category] = [];
            }
            groupedAssets[asset.category].push(asset);
        }

        // Convert to array format for easier frontend consumption
        const categories = Object.entries(groupedAssets).map(([category, assets]) => ({
            category,
            assets,
        }));

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Get featured assets error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch featured assets' },
            { status: 500 }
        );
    }
}
