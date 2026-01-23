import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id] - Get single user details (Admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const { data: user, error } = await supabaseAdmin
            .from('User')
            .select(`
                id, email, name, role, createdAt,
                wallet:Wallet(
                    id, balance,
                    transactions:Transaction(*)
                ),
                assetAccess:AssetAccess(
                    *,
                    assetUnit:AssetUnit(
                        subcategory:Subcategory(id, title, price)
                    )
                ),
                payments:Payment(*)
            `)
            .eq('id', id)
            .single();

        if (error || !user) {
            console.error('Get user error:', error);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Sort and limit nested data manually if needed, or assume RPC handles it if we use one
        // For now, we manually sort/limit the fetched arrays
        const transactions = (user.wallet?.[0]?.transactions || [])
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 20);

        const payments = (user.payments || [])
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                wallet: user.wallet?.[0]
                    ? {
                        balance: toNumber(user.wallet[0].balance),
                        transactions: transactions.map((tx: any) => ({
                            ...tx,
                            amount: toNumber(tx.amount),
                            balanceAfter: toNumber(tx.balanceAfter),
                        })),
                    }
                    : null,
                unlockedAssets: (user.assetAccess || []).map((access: any) => ({
                    ...access,
                    asset: access.assetUnit?.subcategory ? {
                        id: access.assetUnit.subcategory.id,
                        title: access.assetUnit.subcategory.title,
                        price: toNumber(access.assetUnit.subcategory.price),
                    } : null
                })).filter((a: any) => a.asset !== null),
                payments: payments.map((payment: any) => ({
                    ...payment,
                    amount: toNumber(payment.amount),
                })),
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete user (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const { data: user, error: fetchError } = await supabaseAdmin
            .from('User')
            .select('role')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Cannot delete admin users' },
                { status: 400 }
            );
        }

        const { error: deleteError } = await supabaseAdmin
            .from('User')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Delete user error:', deleteError);
            throw deleteError;
        }

        return NextResponse.json({
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
