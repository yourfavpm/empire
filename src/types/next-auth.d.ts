import 'next-auth';

type Role = 'ADMIN' | 'BUYER';

declare module 'next-auth' {
    interface User {
        id: string;
        role: Role;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: Role;
            image?: string | null;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: Role;
    }
}
