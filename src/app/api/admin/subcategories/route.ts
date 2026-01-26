import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { toNumber } from '@/lib/utils';

// GET /api/admin/subcategories - List subcategories
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        let query = supabaseAdmin
            .from('Subcategory')
            .select(`
                *,
                category:Category(name),
                units:AssetUnit(status)
            `)
            .order('title', { ascending: true });

        if (categoryId) {
            query = query.eq('categoryId', categoryId);
        }

        const { data: subcategories, error } = await query;

        if (error) {
            console.error('Fetch subcategories error:', error);
            throw error;
        }

        const formatted = subcategories.map(s => {
            const units = s.units || [];
            const availableUnitCount = units.filter((u: any) => u.status === 'AVAILABLE').length;
            const soldUnitCount = units.filter((u: any) => u.status === 'SOLD').length;

            return {
                id: s.id,
                title: s.title,
                price: toNumber(s.price),
                publicDescription: s.publicDescription,
                countries: s.countries,
                category: s.category?.name || 'Unknown',
                categoryId: s.categoryId,
                stock: {
                    available: availableUnitCount,
                    sold: soldUnitCount,
                    total: units.length
                }
            };
        });

        return NextResponse.json({ subcategories: formatted });
    } catch (error) {
        console.error('Fetch subcategories error:', error);
        return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
    }
}

// POST /api/admin/subcategories - Create new subcategory
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, price, publicDescription, countries, categoryId, logo, previewLink, tutorialLink } = body;

        // Basic validation
        if (!title || !price || !categoryId) {
            return NextResponse.json(
                { error: 'Title, price, and categoryId are required' },
                { status: 400 }
            );
        }

        const { data: subcategory, error } = await supabaseAdmin
            .from('Subcategory')
            .insert({
                title,
                price,
                publicDescription: publicDescription || '',
                countries: countries || [],
                categoryId,
                logo: logo || null,
                previewLink: previewLink || null,
                tutorialLink: tutorialLink || null,
                previewType: body.previewType || 'URL'
            })
            .select()
            .single();

        if (error) {
            console.error('Create subcategory error:', error);
            throw error;
        }

        return NextResponse.json({ subcategory });
    } catch (error) {
        console.error('Create subcategory error:', error);
        return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 });
    }
}
