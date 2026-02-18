import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

interface Subcategory {
    title: string;
    price: number;
    category: { name: string };
}
interface AssetUnit {
    lockedDescription: string;
    subcategory: Subcategory;
}
interface AccessRecord {
    assetUnitId: string;
    assetUnit: AssetUnit;
    orderId: string;
    grantedAt: string;
}

// GET /api/buyer/assets - Get buyer's unlocked asset units
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: accessRecords, error } = await supabaseAdmin
            .from('AssetAccess')
            .select(`
                *,
                assetUnit:AssetUnit(
                    lockedDescription,
                    subcategory:Subcategory(
                        title,
                        price,
                        category:Category(name)
                    )
                )
            `)
            .eq('userId', session.user.id)
            .is('revokedAt', null)
            .order('grantedAt', { ascending: false });

        if (error) {
            console.error('Get buyer assets error:', error);
            throw error;
        }

        return NextResponse.json({
            assets: (accessRecords as unknown as AccessRecord[]).map((access) => ({
                id: access.assetUnitId,
                title: access.assetUnit.subcategory.title,
                category: access.assetUnit.subcategory.category.name,
                price: toNumber(access.assetUnit.subcategory.price),
                lockedDescription: access.assetUnit.lockedDescription,
                orderId: access.orderId,
                unlockedAt: access.grantedAt,
            })),
        });
    } catch (error) {
        console.error('Get buyer assets error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch purchased assets' },
            { status: 500 }
        );
    }
}
