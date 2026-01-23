import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

// GET /api/admin/asset-units - List units for a subcategory (with audit trail)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const subcategoryId = searchParams.get('subcategoryId');

        if (!subcategoryId) {
            return NextResponse.json({ error: 'Subcategory ID is required' }, { status: 400 });
        }

        const { data: units, error } = await supabaseAdmin
            .from('AssetUnit')
            .select(`
                *,
                purchasedBy:User(name, email)
            `)
            .eq('subcategoryId', subcategoryId)
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Fetch units error:', error);
            throw error;
        }

        return NextResponse.json({ units });
    } catch (error) {
        console.error('Fetch units error:', error);
        return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
    }
}

// POST /api/admin/asset-units - Bulk create units
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subcategoryId, units } = body; // units: array of locked descriptions

        if (!subcategoryId || !units || !Array.isArray(units) || units.length === 0) {
            return NextResponse.json({ error: 'Subcategory ID and unit descriptions are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('AssetUnit')
            .insert(units.map((desc: string) => ({
                subcategoryId,
                lockedDescription: desc,
                status: 'AVAILABLE'
            })));

        if (error) {
            console.error('Create units error:', error);
            throw error;
        }

        const count = units.length;

        return NextResponse.json({
            message: `Successfully created ${count} units`,
            count
        });
    } catch (error) {
        console.error('Create units error:', error);
        return NextResponse.json({ error: 'Failed to create units' }, { status: 500 });
    }
}
