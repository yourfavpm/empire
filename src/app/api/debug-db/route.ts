import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // 1. Test connection and basic query
        const { data: userCount, error: userError } = await supabaseAdmin
            .from('User')
            .select('count', { count: 'exact', head: true });

        // 2. Test environment variables (obfuscated)
        const envStatus = {
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            hasAuthSecret: !!process.env.AUTH_SECRET,
        };

        return NextResponse.json({
            status: 'Diagnostic completed',
            env: envStatus,
            database: {
                userTableExists: !userError,
                userCount: userCount || 0,
                error: userError ? {
                    message: userError.message,
                    code: userError.code,
                    hint: userError.hint
                } : null
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'Diagnostic failed',
            error: error.message
        }, { status: 500 });
    }
}
