-- UPDATED SCHEMA & RPCS FOR PAYMENT SYSTEM
-- Run this in Supabase SQL Editor

-- DROP OLD FUNCTIONS FIRST
DROP FUNCTION IF EXISTS handle_payment_success(TEXT, NUMERIC);
DROP FUNCTION IF EXISTS handle_crypto_approval(TEXT);
DROP FUNCTION IF EXISTS handle_crypto_approval(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS handle_crypto_approval(TEXT, TEXT, TEXT);

-- 1. Correct handle_payment_success
CREATE OR REPLACE FUNCTION handle_payment_success(p_reference TEXT, p_amount NUMERIC)
RETURNS JSONB AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    UPDATE "Payment" SET status = 'APPROVED'::"PaymentStatus", "updatedAt" = NOW()
    WHERE reference = p_reference AND status NOT IN ('APPROVED'::"PaymentStatus", 'VERIFIED'::"PaymentStatus")
    RETURNING "userId" INTO v_user_id;

    IF FOUND THEN
        UPDATE "Wallet" SET balance = balance + p_amount, "updatedAt" = NOW()
        WHERE "userId" = v_user_id;

        -- Using lowercase 'userid' if "userId" failed previously, 
        -- but testing unquoted userid which is most robust in Postgres
        INSERT INTO "Transaction" (userid, amount, type, status, description)
        VALUES (v_user_id, p_amount, 'CREDIT', 'COMPLETED', 'Wallet Funding (Paystack)');
        
        RETURN jsonb_build_object('status', 'success', 'userId', v_user_id);
    END IF;
    
    RETURN jsonb_build_object('status', 'already_processed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fixed handle_crypto_approval
CREATE OR REPLACE FUNCTION handle_crypto_approval(
    p_payment_id TEXT,
    p_action TEXT,
    p_admin_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_new_status TEXT;
    v_user_id TEXT;
BEGIN
    -- Fetch Payment
    SELECT * INTO v_payment FROM "Payment" WHERE id = p_payment_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Payment not found (ID: ' || p_payment_id || ')');
    END IF;

    IF v_payment.status != 'PENDING'::"PaymentStatus" THEN
        RETURN jsonb_build_object('status', 'already_processed', 'current_status', v_payment.status);
    END IF;

    v_user_id := v_payment."userId";

    IF p_action = 'approve' THEN
        v_new_status := 'APPROVED';
        
        -- Update Payment Status
        UPDATE "Payment"
        SET status = v_new_status::"PaymentStatus",
            "adminNote" = p_admin_note,
            "updatedAt" = now()
        WHERE id = p_payment_id;

        -- Credit Wallet
        UPDATE "Wallet"
        SET balance = balance + v_payment.amount,
            "updatedAt" = now()
        WHERE "userId" = v_user_id;

        -- Create Transaction Record (Credit)
        -- Using unquoted column names for maximum compatibility
        INSERT INTO "Transaction" (
            userid,
            type,
            amount,
            description,
            status
        ) VALUES (
            v_user_id,
            'CREDIT',
            v_payment.amount,
            'Crypto Deposit Approved (' || v_payment.reference || ')',
            'COMPLETED'
        );

        RETURN jsonb_build_object('status', 'approved');
        
    ELSIF p_action = 'reject' THEN
        v_new_status := 'REJECTED';

        -- Update Payment Status
        UPDATE "Payment"
        SET status = v_new_status::"PaymentStatus",
            "adminNote" = p_admin_note,
            "updatedAt" = now()
        WHERE id = p_payment_id;
        
        RETURN jsonb_build_object('status', 'rejected');
    ELSE
         RETURN jsonb_build_object('status', 'error', 'message', 'Invalid action: ' || p_action);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
