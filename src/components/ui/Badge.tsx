'use client';

import { cn, getStatusColor, getPaymentStatusColor } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: 'bg-slate-700 text-slate-300',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        error: 'bg-red-500/20 text-red-400 border border-red-500/30',
        info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

interface StatusBadgeProps {
    status: string;
    type?: 'asset' | 'payment';
}

export function StatusBadge({ status, type = 'asset' }: StatusBadgeProps) {
    const getVariant = (): BadgeProps['variant'] => {
        if (type === 'payment') {
            switch (status) {
                case 'VERIFIED':
                case 'APPROVED':
                    return 'success';
                case 'PENDING':
                    return 'warning';
                case 'FAILED':
                case 'REJECTED':
                    return 'error';
                default:
                    return 'default';
            }
        } else {
            switch (status) {
                case 'ACTIVE':
                    return 'success';
                case 'DRAFT':
                    return 'warning';
                case 'SOLD':
                    return 'default';
                default:
                    return 'default';
            }
        }
    };

    return (
        <Badge variant={getVariant()}>
            {status}
        </Badge>
    );
}
