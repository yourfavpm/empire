
export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN', // Legacy/Root
    GENERAL_ADMIN = 'GENERAL_ADMIN',
    FINANCE_MANAGER = 'FINANCE_MANAGER',
    INVENTORY_MANAGER = 'INVENTORY_MANAGER',
}

export const ADMIN_ROLES = Object.values(AdminRole);

export interface RoleConfig {
    id: AdminRole;
    name: string;
    description: string;
    allowedRoutes: string[];
}

export const ROLE_CONFIGS: Record<AdminRole, RoleConfig> = {
    [AdminRole.SUPER_ADMIN]: {
        id: AdminRole.SUPER_ADMIN,
        name: 'Super Admin',
        description: 'Full system access & team management',
        allowedRoutes: ['/admin', '/admin/assets', '/admin/users', '/admin/payments', '/admin/messages', '/admin/team', '/admin/settings'],
    },
    [AdminRole.ADMIN]: {
        id: AdminRole.ADMIN,
        name: 'System Admin',
        description: 'Full system access (Legacy)',
        allowedRoutes: ['/admin', '/admin/assets', '/admin/users', '/admin/payments', '/admin/messages', '/admin/team', '/admin/settings'],
    },
    [AdminRole.GENERAL_ADMIN]: {
        id: AdminRole.GENERAL_ADMIN,
        name: 'General Admin',
        description: 'Manage everything except team members',
        allowedRoutes: ['/admin', '/admin/assets', '/admin/users', '/admin/payments', '/admin/messages', '/admin/settings'],
    },
    [AdminRole.FINANCE_MANAGER]: {
        id: AdminRole.FINANCE_MANAGER,
        name: 'Finance Manager',
        description: 'Payments and user ledger management',
        allowedRoutes: ['/admin', '/admin/payments', '/admin/users'],
    },
    [AdminRole.INVENTORY_MANAGER]: {
        id: AdminRole.INVENTORY_MANAGER,
        name: 'Inventory Manager',
        description: 'Assets and stock inventory only',
        allowedRoutes: ['/admin', '/admin/assets'],
    },
};

export function isAuthorized(role: string | undefined, path: string): boolean {
    if (!role || !ADMIN_ROLES.includes(role as AdminRole)) return false;
    const config = ROLE_CONFIGS[role as AdminRole];
    if (!config) return false;
    
    // Check if the current path starts with any of the allowed routes
    // and handle the base '/admin' case carefully
    if (path === '/admin') return config.allowedRoutes.includes('/admin');
    
    return config.allowedRoutes.some(route => route !== '/admin' && path.startsWith(route));
}
