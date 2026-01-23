import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/admin/assets/[id]/feature - Toggle featured status for subcategory
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

        // Verify subcategory exists
        const { data: existingSub, error: fetchError } = await supabaseAdmin
            .from('Subcategory')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingSub) {
            return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
        }

        // Update featured status
        const { data: updatedSub, error: updateError } = await supabaseAdmin
            .from('Subcategory')
            .update({
                featured: featured ?? existingSub.featured,
                featuredOrder: featuredOrder ?? existingSub.featuredOrder,
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Toggle feature error:', updateError);
            throw updateError;
        }

        return NextResponse.json({
            message: featured ? 'Subcategory featured' : 'Subcategory unfeatured',
            subcategory: updatedSub,
        });
    } catch (error) {
        console.error('Toggle feature error:', error);
        return NextResponse.json(
            { error: 'Failed to update subcategory' },
            { status: 500 }
        );
    }
}
