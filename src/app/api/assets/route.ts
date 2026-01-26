import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

// GET /api/assets - List subcategories (the browseable product units)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const searchParams = request.nextUrl.searchParams;
        const categoryName = searchParams.get('category'); // Filter by category name
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabaseAdmin
            .from('Subcategory')
            .select(`
                *,
                category:Category!inner(name),
                units:AssetUnit(count)
            `, { count: 'exact' })
            .eq('units.status', 'AVAILABLE');

        if (categoryName) {
            query = query.eq('category.name', categoryName);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,publicDescription.ilike.%${search}%`);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: subcategories, count: total, error } = await query
            .order('createdAt', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Get subcategories error:', error);
            throw error;
        }

        return NextResponse.json({
            subcategories: subcategories.map((sub: any) => ({
                id: sub.id,
                title: sub.title,
                category: sub.category?.name || 'Unknown',
                price: toNumber(sub.price),
                description: sub.publicDescription,
                countries: sub.countries,
                logo: sub.logo,
                availableStock: sub.units?.[0]?.count || 0,
                isOutOfStock: (sub.units?.[0]?.count || 0) === 0
            })),
            pagination: {
                page,
                limit,
                total: total || 0,
                totalPages: Math.ceil((total || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Get subcategories error:', error);
        return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
    }
}
