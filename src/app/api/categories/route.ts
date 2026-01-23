import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/categories - List all categories for public browsing
export async function GET() {
    try {
        const { data: categories, error } = await supabaseAdmin
            .from('Category')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Fetch public categories error:', error);
            throw error;
        }

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Fetch public categories error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
