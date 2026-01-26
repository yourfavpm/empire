import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, country, whatsappNumber, referrerId } = body;

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const { data: newUser, error: userError } = await supabaseAdmin
            .from('User')
            .insert({
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                country: country || null,
                whatsappNumber: whatsappNumber || null,
                role: 'BUYER',
                referrerId: referrerId || null // Add referrerId
            })
            .select()
            .single();

        if (userError || !newUser) {
            console.error('User creation error:', userError);
            throw new Error('Failed to create user record');
        }

        // Create wallet
        const { error: walletError } = await supabaseAdmin
            .from('Wallet')
            .insert({
                userId: newUser.id,
                balance: 0
            });

        if (walletError) {
            console.error('Wallet creation error:', walletError);
            // Note: In a production app, you might want to rollback the user creation here or handle this more gracefully
        }

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to create account. Please try again.' },
            { status: 500 }
        );
    }
}
