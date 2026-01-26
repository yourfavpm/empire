-- UPDATED SCHEMA & RPCS FOR PAYMENT SYSTEM
-- Run this in Supabase SQL Editor

-- DROP OLD FUNCTIONS FIRST (Needed when changing return types or arguments)
DROP FUNCTION IF EXISTS handle_payment_success(TEXT, NUMERIC);
DROP FUNCTION IF EXISTS handle_crypto_approval(TEXT);
DROP FUNCTION IF EXISTS handle_crypto_approval(UUID, TEXT, TEXT);

-- 1. Ensure handle_payment_success uses APPROVED status
CREATE OR REPLACE FUNCTION handle_payment_success(p_reference TEXT, p_amount NUMERIC)
RETURNS JSONB AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    UPDATE "Payment" SET status = 'APPROVED', "updatedAt" = NOW()
    WHERE reference = p_reference AND status NOT IN ('APPROVED', 'VERIFIED')
    RETURNING "userId" INTO v_user_id;

    IF FOUND THEN
        UPDATE "Wallet" SET balance = balance + p_amount, "updatedAt" = NOW()
        WHERE "userId" = v_user_id;

        INSERT INTO "Transaction" ("userId", amount, type, status, description)
        VALUES (v_user_id, p_amount, 'CREDIT', 'COMPLETED', 'Wallet Funding (Paystack)');
        
        RETURN jsonb_build_object('status', 'success', 'userId', v_user_id);
    END IF;
    
    RETURN jsonb_build_object('status', 'already_processed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fixed handle_crypto_approval with correct signatures and behavior
CREATE OR REPLACE FUNCTION handle_crypto_approval(
    p_payment_id UUID,
    p_action TEXT,
    p_admin_note TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_new_status TEXT;
    v_user_id TEXT;
BEGIN
    -- Fetch Payment
    SELECT * INTO v_payment FROM "Payment" WHERE id = p_payment_id::TEXT;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Payment not found');
    END IF;

    IF v_payment.status != 'PENDING' THEN
        RETURN jsonb_build_object('status', 'already_processed');
    END IF;

    v_user_id := v_payment."userId";

    IF p_action = 'approve' THEN
        v_new_status := 'APPROVED';
        
        -- Update Payment Status
        UPDATE "Payment"
        SET status = v_new_status,
            "adminNote" = p_admin_note,
            "updatedAt" = now()
        WHERE id = p_payment_id::TEXT;

        -- Credit Wallet
        UPDATE "Wallet"
        SET balance = balance + v_payment.amount,
            "updatedAt" = now()
        WHERE "userId" = v_user_id;

        -- Create Transaction Record (Credit)
        INSERT INTO "Transaction" (
            "userId",
            type,
            amount,
            description,
            status,
            "createdAt",
            "updatedAt"
        ) VALUES (
            v_user_id,
            'CREDIT',
            v_payment.amount,
            'Crypto Deposit Approved (' || v_payment.reference || ')',
            'COMPLETED',
            now(),
            now()
        );

        RETURN jsonb_build_object('status', 'approved');
        
    ELSIF p_action = 'reject' THEN
        v_new_status := 'REJECTED';

        -- Update Payment Status
        UPDATE "Payment"
        SET status = v_new_status,
            "adminNote" = p_admin_note,
            "updatedAt" = now()
        WHERE id = p_payment_id::TEXT;
        
        RETURN jsonb_build_object('status', 'rejected');
    ELSE
         RETURN jsonb_build_object('status', 'error', 'message', 'Invalid action');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
