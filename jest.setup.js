import '@testing-library/jest-dom'

jest.mock('uuid', () => ({
    v4: () => 'test-uuid-1234',
}));
