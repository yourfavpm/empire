import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: categories, error } = await supabaseAdmin
            .from('Category')
            .select(`
                *,
                subcategories:Subcategory(count)
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error('Fetch categories error:', error);
            throw error;
        }

        // Transform results to match Prisma's output structure if necessary
        const transformedCategories = categories?.map(cat => ({
            ...cat,
            _count: {
                subcategories: cat.subcategories?.[0]?.count || 0
            }
        }));

        return NextResponse.json({ categories: transformedCategories });
    } catch (error) {
        console.error('Fetch categories error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const { data: category, error } = await supabaseAdmin
            .from('Category')
            .insert({ name })
            .select()
            .single();

        if (error) {
            console.error('Create category error:', error);
            throw error;
        }

        return NextResponse.json({ category });
    } catch (error: any) {
        console.error('Create category error:', error);
        return NextResponse.json({
            error: `Failed: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}
