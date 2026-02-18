-- FIX PAYSTACK RPC (handle_payment_success)
-- Run this in Supabase SQL Editor

-- Drop incorrect function signature if it exists
DROP FUNCTION IF EXISTS handle_payment_success(TEXT, NUMERIC);

-- Correct RPC: Uses userId instead of walletId (Transaction table uses userId)
CREATE OR REPLACE FUNCTION handle_payment_success(p_reference TEXT, p_amount NUMERIC)
RETURNS JSONB AS $$
DECLARE
    v_user_id TEXT;
    v_old_balance NUMERIC;
    v_new_balance NUMERIC;
    v_payment_id TEXT;
BEGIN
    -- 1. Verify Payment and get User ID
    UPDATE "Payment" 
    SET status = 'APPROVED', "updatedAt" = NOW()
    WHERE reference = p_reference AND status != 'APPROVED'
    RETURNING "userId", id INTO v_user_id, v_payment_id;

    IF v_user_id IS NULL THEN
        -- Check if it was already approved
        IF EXISTS (SELECT 1 FROM "Payment" WHERE reference = p_reference AND status = 'APPROVED') THEN
            RETURN jsonb_build_object('status', 'already_processed');
        ELSE
            RETURN jsonb_build_object('status', 'error', 'message', 'Payment not found or not pending');
        END IF;
    END IF;

    -- 2. Update Wallet Balance
    SELECT balance INTO v_old_balance FROM "Wallet" WHERE "userId" = v_user_id FOR UPDATE;
    
    IF v_old_balance IS NULL THEN
         RETURN jsonb_build_object('status', 'error', 'message', 'Wallet not found for user');
    END IF;

    UPDATE "Wallet" 
    SET balance = balance + p_amount, "updatedAt" = NOW()
    WHERE "userId" = v_user_id
    RETURNING balance INTO v_new_balance;

    -- 3. Record Transaction
    INSERT INTO "Transaction" ("userId", amount, type, status, description, "createdAt")
    VALUES (v_user_id, p_amount, 'CREDIT', 'COMPLETED', 'Wallet Funding (Paystack)', NOW());
    
    RETURN jsonb_build_object('status', 'success', 'userId', v_user_id, 'newBalance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
