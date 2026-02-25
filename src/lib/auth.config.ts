import type { NextAuthConfig } from 'next-auth';
import { AdminRole, ROOT_ADMIN_EMAILS } from './roles';

// Edge-compatible auth config without Node.js-specific imports
export const authConfig = {
    providers: [], // Providers configured separately in auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                // Force SUPER_ADMIN for root emails
                token.role = (user.email && ROOT_ADMIN_EMAILS.includes(user.email)) 
                    ? AdminRole.SUPER_ADMIN 
                    : user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
                session.user.email = token.email as string;
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

