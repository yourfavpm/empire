'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { InstructionalModal } from './ui/InstructionalModal';

interface ModalContextType {
    showInstructionalModal: () => void;
    hideInstructionalModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    // Show modal on mount (every page load)
    useEffect(() => {
        setIsOpen(true);
    }, []);

    const showInstructionalModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const hideInstructionalModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <ModalContext.Provider value={{ showInstructionalModal, hideInstructionalModal }}>
            {children}
            <InstructionalModal
                isOpen={isOpen}
                onClose={hideInstructionalModal}
            />
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
