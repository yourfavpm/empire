import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { toNumber } from '@/lib/utils';

// GET /api/wallet - Get current user's wallet
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: wallet, error } = await supabaseAdmin
            .from('Wallet')
            .select(`
                *,
                transactions:Transaction(*)
            `)
            .eq('userId', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" for .single()
            console.error('Fetch wallet error:', error);
            throw error;
        }

        if (!wallet) {
            // Create wallet if it doesn't exist
            const { data: newWallet, error: createError } = await supabaseAdmin
                .from('Wallet')
                .insert({
                    userId: session.user.id,
                    balance: 0,
                })
                .select()
                .single();

            if (createError) {
                console.error('Create wallet error:', createError);
                throw createError;
            }

            return NextResponse.json({
                balance: 0,
                transactions: [],
                wallet: newWallet,
            });
        }

        // Sort transactions descending (Supabase might not guarantee order on related selection without complex syntax)
        const sortedTransactions = (wallet.transactions || []).sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 20);

        return NextResponse.json({
            balance: toNumber(wallet.balance),
            transactions: sortedTransactions.map((tx: any) => ({
                ...tx,
                amount: toNumber(tx.amount),
                balanceAfter: toNumber(tx.balanceAfter),
            })),
            wallet: {
                id: wallet.id,
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt,
            },
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet' },
            { status: 500 }
        );
    }
}
