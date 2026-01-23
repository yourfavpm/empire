'use client';

import { SessionProvider } from 'next-auth/react';
import { ModalProvider } from './ModalContext';
import { ThemeProvider } from './ThemeContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <ModalProvider>
                    {children}
                    <Toaster position="bottom-right" />
                </ModalProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
