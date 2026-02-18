import { formatCurrency, formatDate, cn } from '../src/lib/utils'; // Adjust path if needed

describe('Utility Functions', () => {
    describe('formatCurrency', () => {
        it('formats currency correctly for NGN', () => {
            expect(formatCurrency(1000)).toBe('₦1,000.00');
            expect(formatCurrency(0)).toBe('₦0.00');
            expect(formatCurrency(1234.56)).toBe('₦1,234.56');
        });
    });

    // Add more tests as needed
});
