import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

// GET /api/assets/[id] - Get subcategory details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: subcategory, error } = await supabaseAdmin
            .from('Subcategory')
            .select(`
                *,
                category:Category(name),
                units:AssetUnit(count)
            `)
            .eq('id', id)
            .eq('units.status', 'AVAILABLE')
            .single();

        if (error || !subcategory) {
            console.error('Get subcategory error:', error);
            return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
        }

        const availableStock = subcategory.units?.[0]?.count || 0;

        return NextResponse.json({
            subcategory: {
                id: subcategory.id,
                title: subcategory.title,
                category: subcategory.category?.name || 'Unknown',
                price: toNumber(subcategory.price),
                description: subcategory.publicDescription,
                countries: subcategory.countries,
                availableStock: availableStock,
                isOutOfStock: availableStock === 0
            }
        });
    } catch (error) {
        console.error('Get subcategory error:', error);
        return NextResponse.json({ error: 'Failed to fetch subcategory' }, { status: 500 });
    }
}
