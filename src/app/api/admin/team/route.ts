
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const ADMIN_ROLES = ['SUPER_ADMIN', 'GENERAL_ADMIN', 'FINANCE_MANAGER', 'INVENTORY_MANAGER'];

// GET /api/admin/team - List all admins
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        // Allow any admin role to view the list (though UI might hide it for some)
        if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: admins, error } = await supabaseAdmin
            .from('User')
            .select('id, name, email, role, blocked, createdAt, lastLogin')
            .in('role', ADMIN_ROLES)
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
        // ONLY Super Admin can create new admins
        if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized: Only Super Admins can add team members' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!ADMIN_ROLES.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
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
                role,
                blocked: false,
                emailVerified: new Date(),
            })
            .select()
            .single();

        if (error) throw error;

        // Create Wallet
        await supabaseAdmin.from('Wallet').insert({ userId: newAdmin.id, balance: 0 });

        return NextResponse.json({ admin: newAdmin });
    } catch (error) {
        console.error('Create admin error:', error);
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
}

// PATCH /api/admin/team - Toggle status
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { id, blocked } = body;

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('User')
            .update({ blocked })
            .eq('id', id)
            .in('role', ADMIN_ROLES); // Safety check

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json({ error: 'Failed to update admin status' }, { status: 500 });
    }
}
