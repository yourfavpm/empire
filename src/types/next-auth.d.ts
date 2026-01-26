import 'next-auth';

type Role = 'SUPER_ADMIN' | 'GENERAL_ADMIN' | 'FINANCE_MANAGER' | 'INVENTORY_MANAGER' | 'BUYER' | 'ADMIN';

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
