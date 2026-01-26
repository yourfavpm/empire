import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Types
export interface PaystackInitResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        domain: string;
        status: string;
        reference: string;
        amount: number;
        message: string | null;
        gateway_response: string;
        paid_at: string;
        created_at: string;
        channel: string;
        currency: string;
        metadata: Record<string, unknown>;
        customer: {
            id: number;
            email: string;
            customer_code: string;
            first_name: string | null;
            last_name: string | null;
        };
    };
}

// Initialize payment
export async function initializePayment(
    email: string,
    amount: number, // Amount in Naira
    reference: string,
    metadata?: Record<string, unknown>
): Promise<PaystackInitResponse> {
    if (!PAYSTACK_SECRET_KEY) {
        throw new Error('Paystack secret key is not configured');
    }

    const response = await axios.post<PaystackInitResponse>(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
            email,
            amount: Math.round(amount * 100), // Convert to kobo
            reference,
            callback_url: `${process.env.AUTH_URL}/buyer/wallet?payment=callback`,
            metadata: {
                ...metadata,
                custom_fields: [
                    {
                        display_name: 'Payment Reference',
                        variable_name: 'payment_reference',
                        value: reference,
                    },
                ],
            },
        },
        {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data;
}

// Verify payment
export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    if (!PAYSTACK_SECRET_KEY) {
        throw new Error('Paystack secret key is not configured');
    }

    const response = await axios.get<PaystackVerifyResponse>(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        }
    );

    return response.data;
}

// Validate webhook signature
export function validateWebhookSignature(
    payload: string,
    signature: string
): boolean {
    const crypto = require('crypto');
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

    if (!webhookSecret) {
        // If no webhook secret configured, skip validation (not recommended for production)
        console.warn('Paystack webhook secret not configured');
        return true;
    }

    const hash = crypto
        .createHmac('sha512', webhookSecret)
        .update(payload)
        .digest('hex');

    return hash === signature;
}

// Get payment status from Paystack status
export function getPaymentStatus(paystackStatus: string): 'APPROVED' | 'PENDING' | 'FAILED' {
    switch (paystackStatus) {
        case 'success':
            return 'APPROVED';
        case 'failed':
        case 'abandoned':
            return 'FAILED';
        default:
            return 'PENDING';
    }
}
