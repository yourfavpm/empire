
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/admin/team - List all admins
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: admins, error } = await supabaseAdmin
            .from('User')
            .select('id, name, email, role, createdAt, lastLogin')
            .eq('role', 'ADMIN')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ admins });
    } catch (error) {
        console.error('Fetch admins error:', error);
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}

// POST /api/admin/team - Invite/Create new Admin
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check availability
        const { data: existing } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newAdmin, error } = await supabaseAdmin
            .from('User')
            .insert({
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: new Date(), // Auto-verify admin
            })
            .select()
            .single();

        if (error) throw error;

        // Create Wallet for consistency (optional for admins but good practice)
        await supabaseAdmin.from('Wallet').insert({ userId: newAdmin.id, balance: 0 });

        return NextResponse.json({ admin: newAdmin });
    } catch (error) {
        console.error('Create admin error:', error);
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
}
