import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/ui/Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('handles onClick events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant classes', () => {
        const { container } = render(<Button variant="outline">Outline Button</Button>);
        expect(container.firstChild).toHaveClass('border-brand/20');
    });

    it('is disabled when disabled prop is passed', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByText('Disabled')).toBeDisabled();
    });
});
