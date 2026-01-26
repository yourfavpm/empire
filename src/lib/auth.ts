import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';
import { authConfig } from './auth.config';
import { createHmac } from 'node:crypto';

// Full auth config with credentials provider (Node.js runtime only)
export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
                impersonationToken: { label: 'Impersonation Token', type: 'text' }
            },
            async authorize(credentials) {
                // Impersonation Flow
                if (credentials?.impersonationToken) {
                    try {
                        const token = credentials.impersonationToken as string;
                        const parts = token.split('.');
                        if (parts.length !== 3) return null;

                        const [userId, timestamp, signature] = parts;
                        const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret'; // Must match API

                        // Verify Signature
                        const expectedSignature = createHmac('sha256', secret).update(`${userId}.${timestamp}`).digest('hex');

                        if (signature !== expectedSignature) return null;

                        // Verify Expiry (e.g., 5 minutes)
                        const now = Date.now();
                        if (now - Number(timestamp) > 5 * 60 * 1000) return null;

                        // Fetch User
                        const { data: user, error } = await supabaseAdmin
                            .from('User')
                            .select('id, email, name, role, image, blocked')
                            .eq('id', userId)
                            .single();

                        if (user && !error) {
                            if (user.blocked) {
                                throw new Error('Cannot impersonate a suspended user.');
                            }
                            return { ...user };
                        }
                        return null;
                    } catch (e) {
                        return null;
                    }
                }

                // standard login flow...
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const { data: user, error } = await supabaseAdmin
                    .from('User')
                    .select('id, email, name, password, role, image, blocked')
                    .eq('email', credentials.email as string)
                    .single();

                if (error || !user) {
                    return null;
                }

                // Check if user is blocked
                if (user.blocked) {
                    throw new Error('Your account has been suspended. Please contact support.');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
});

