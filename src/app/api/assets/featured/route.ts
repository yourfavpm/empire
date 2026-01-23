import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/assets/featured - Get featured assets (subcategories) grouped by category
export async function GET(req: NextRequest) {
    try {
        // Get all featured subcategories
        const { data: featuredAssets, error } = await supabaseAdmin
            .from('Subcategory')
            .select(`
                id,
                title,
                price,
                publicDescription,
                category:Category(name)
            `)
            .eq('featured', true)
            .order('featuredOrder', { ascending: true });

        if (error) {
            console.error('Get featured assets error:', error);
            throw error;
        }

        // Group by category name
        const groupedAssets: Record<string, any[]> = {};

        for (const asset of (featuredAssets || [])) {
            const categoryName = (asset.category as any)?.name || 'Uncategorized';
            if (!groupedAssets[categoryName]) {
                groupedAssets[categoryName] = [];
            }
            groupedAssets[categoryName].push({
                id: asset.id,
                title: asset.title,
                category: categoryName,
                price: asset.price,
                shortDescription: asset.publicDescription?.substring(0, 100) + '...',
            });
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
