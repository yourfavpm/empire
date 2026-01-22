import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Generate unique payment reference
export function generatePaymentReference(): string {
    const timestamp = Date.now().toString(36);
    const uniqueId = uuidv4().split('-')[0];
    return `PAY-${timestamp}-${uniqueId}`.toUpperCase();
}

// Format currency (Nigerian Naira)
export function formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
    }).format(numAmount);
}

// Format date
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(d);
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

// Validate email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Delay utility for rate limiting
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Parse Decimal from Prisma to number
export function toNumber(decimal: unknown): number {
    if (typeof decimal === 'number') return decimal;
    if (typeof decimal === 'string') return parseFloat(decimal);
    if (decimal && typeof decimal === 'object' && 'toNumber' in decimal) {
        return (decimal as { toNumber: () => number }).toNumber();
    }
    return 0;
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}

// Get initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Asset status display
export function getStatusColor(status: string): string {
    switch (status) {
        case 'ACTIVE':
            return 'bg-green-100 text-green-800';
        case 'DRAFT':
            return 'bg-yellow-100 text-yellow-800';
        case 'SOLD':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Payment status display
export function getPaymentStatusColor(status: string): string {
    switch (status) {
        case 'VERIFIED':
        case 'APPROVED':
            return 'bg-green-100 text-green-800';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800';
        case 'FAILED':
        case 'REJECTED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
