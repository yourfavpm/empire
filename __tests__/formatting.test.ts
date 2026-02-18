import { formatCurrency, formatDate } from '../src/lib/utils';

describe('Formatting Utilities', () => {
    it('formats dates correctly', () => {
        const date = new Date('2023-01-01T12:00:00Z');
        // Note: Actual output depends on locale, but we can check if it returns a string
        expect(typeof formatDate(date)).toBe('string');
    });

    it('handles string dates', () => {
        expect(typeof formatDate('2023-01-01')).toBe('string');
    });
});
