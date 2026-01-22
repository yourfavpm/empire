'use client';

import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
}

export function Card({ children, className, hover = false, gradient = false }: CardProps) {
    return (
        <div
            className={cn(
                'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6',
                hover && 'hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300',
                gradient && 'bg-gradient-to-br from-slate-800/80 to-slate-900/80',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={cn('text-lg font-semibold text-white', className)}>
            {children}
        </h3>
    );
}

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p className={cn('text-sm text-slate-400 mt-1', className)}>
            {children}
        </p>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={cn('', className)}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={cn('mt-4 pt-4 border-t border-slate-700/50', className)}>
            {children}
        </div>
    );
}
