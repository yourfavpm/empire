import NextAuth from 'next-auth';

// Edge-compatible auth config without Node.js-specific imports
export const authConfig = {
    providers: [], // Providers configured separately for API routes
    callbacks: {
        async jwt({ token, user }: { token: any; user?: any }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
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
        strategy: 'jwt' as const,
        maxAge: 30 * 24 * 60 * 60,
    },
    trustHost: true,
};

export const { auth } = NextAuth(authConfig);
