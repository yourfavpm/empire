'use client';

import { SessionProvider } from 'next-auth/react';
import { ModalProvider } from './ModalContext';
import { ThemeProvider } from './ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <ModalProvider>
                    {children}
                </ModalProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
