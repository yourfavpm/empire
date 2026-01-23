import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return NextResponse.json({
                error: 'ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required on Vercel.'
            }, { status: 400 });
        }

        // Hash the admin password
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        // 1. Create or Update admin user using upsert (on email conflict)
        const { data: admin, error: adminError } = await supabaseAdmin
            .from('User')
            .upsert({
                email: adminEmail.toLowerCase(),
                password: hashedPassword,
                name: 'System Admin',
                role: 'ADMIN'
            }, { onConflict: 'email' })
            .select()
            .single();

        if (adminError) {
            console.error('Admin seeding error:', adminError);
            throw adminError;
        }

        // 2. Create or Update wallet for admin
        const { error: walletError } = await supabaseAdmin
            .from('Wallet')
            .upsert({
                userId: admin.id,
                balance: 0
            }, { onConflict: 'userId' });

        if (walletError) {
            console.error('Admin wallet seeding error:', walletError);
        }

        return NextResponse.json({
            message: 'Admin account seeded successfully.',
            email: adminEmail,
            role: 'ADMIN'
        });
    } catch (error: any) {
        console.error('Setup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
