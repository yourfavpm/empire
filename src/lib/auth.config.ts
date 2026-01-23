import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config without Node.js-specific imports
export const authConfig = {
    providers: [], // Providers configured separately in auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as 'BUYER' | 'ADMIN';
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    trustHost: true,
} satisfies NextAuthConfig;

