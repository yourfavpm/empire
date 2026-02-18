import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Navbar } from '../src/components/layout/Navbar';
import { useSession } from 'next-auth/react';

// Mock child components
jest.mock('../src/components/layout/HeaderBanner', () => ({
    HeaderBanner: () => <div data-testid="header-banner">HeaderBanner</div>,
}));
jest.mock('../src/components/layout/SideDrawer', () => ({
    SideDrawer: () => <div data-testid="side-drawer">SideDrawer</div>,
}));
jest.mock('lucide-react', () => ({
    Menu: () => <div data-testid="menu-icon">Menu</div>,
}));

// Mock next-auth/react
jest.mock('next-auth/react');

describe('Navbar Component', () => {
    const mockUseSession = useSession as jest.Mock;

    beforeEach(() => {
        mockUseSession.mockReset();
    });

    it('renders "Sign In" and "Get Started" when unauthenticated', () => {
        mockUseSession.mockReturnValue({
            data: null,
            status: 'unauthenticated',
        });

        render(<Navbar />);

        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getByText('Get Started')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('renders "Dashboard" and user name when authenticated', () => {
        mockUseSession.mockReturnValue({
            data: {
                user: {
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'USER',
                },
            },
            status: 'authenticated',
        });

        render(<Navbar />);

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('renders "Admin Dashboard" if user role is ADMIN', () => {
        mockUseSession.mockReturnValue({
            data: {
                user: {
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'ADMIN',
                },
            },
            status: 'authenticated',
        });

        render(<Navbar />);

        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
});
