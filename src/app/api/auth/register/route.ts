import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isValidEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

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
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with wallet
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                role: 'BUYER',
                wallet: {
                    create: {
                        balance: 0,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user,
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
