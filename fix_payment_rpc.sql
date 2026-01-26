-- FINAL SCHEMA & RPC FIXES FOR PAYMENT & ASSET SYSTEM (v17)
-- Run this in Supabase SQL Editor

-- DROP OLD FUNCTIONS
DROP FUNCTION IF EXISTS handle_payment_success(TEXT, NUMERIC);
DROP FUNCTION IF EXISTS handle_crypto_approval(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS admin_adjust_wallet(TEXT, NUMERIC, TEXT, TEXT);
DROP FUNCTION IF EXISTS process_purchase(TEXT, JSONB);

-- 1. Correct handle_payment_success
CREATE OR REPLACE FUNCTION handle_payment_success(p_reference TEXT, p_amount NUMERIC)
RETURNS JSONB AS $$
DECLARE
    v_user_id TEXT;
    v_wallet_id TEXT;
    v_new_balance NUMERIC;
BEGIN
    UPDATE "Payment" SET status = 'APPROVED'::"PaymentStatus", "updatedAt" = NOW()
    WHERE reference = p_reference AND status NOT IN ('APPROVED'::"PaymentStatus", 'VERIFIED'::"PaymentStatus")
    RETURNING "userId" INTO v_user_id;

    IF FOUND THEN
        UPDATE "Wallet" SET balance = balance + p_amount, "updatedAt" = NOW()
        WHERE "userId" = v_user_id
        RETURNING id, balance INTO v_wallet_id, v_new_balance;

        INSERT INTO "Transaction" ("walletId", amount, type, description, "balanceAfter", "createdAt")
        VALUES (v_wallet_id, p_amount, 'CREDIT'::"TransactionType", 'Wallet Funding (Paystack)', v_new_balance, NOW());
        
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
    v_user_id TEXT;
    v_wallet_id TEXT;
    v_new_balance NUMERIC;
BEGIN
    SELECT * INTO v_payment FROM "Payment" WHERE id = p_payment_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Payment not found');
    END IF;

    IF v_payment.status != 'PENDING'::"PaymentStatus" THEN
        RETURN jsonb_build_object('status', 'already_processed');
    END IF;

    v_user_id := v_payment."userId";

    IF p_action = 'approve' THEN
        UPDATE "Payment"
        SET status = 'APPROVED'::"PaymentStatus",
            "adminNote" = p_admin_note,
            "updatedAt" = now()
        WHERE id = p_payment_id;

        UPDATE "Wallet"
        SET balance = balance + v_payment.amount,
            "updatedAt" = now()
        WHERE "userId" = v_user_id
        RETURNING id, balance INTO v_wallet_id, v_new_balance;

        INSERT INTO "Transaction" (
            "walletId",
            type,
            amount,
            description,
            "balanceAfter",
            "createdAt"
        ) VALUES (
            v_wallet_id,
            'CREDIT'::"TransactionType",
            v_payment.amount,
            'Crypto Deposit Approved (' || v_payment.reference || ')',
            v_new_balance,
            now()
        );

        RETURN jsonb_build_object('status', 'approved');
        
    ELSIF p_action = 'reject' THEN
        UPDATE "Payment"
        SET status = 'REJECTED'::"PaymentStatus",
            "adminNote" = p_admin_note,
            "updatedAt" = now()
        WHERE id = p_payment_id;
        
        RETURN jsonb_build_object('status', 'rejected');
    ELSE
         RETURN jsonb_build_object('status', 'error', 'message', 'Invalid action');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fixed admin_adjust_wallet
CREATE OR REPLACE FUNCTION admin_adjust_wallet(
    p_user_id TEXT, 
    p_amount NUMERIC, 
    p_admin_id TEXT, 
    p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
    v_wallet_id TEXT;
    v_new_balance NUMERIC;
BEGIN
    UPDATE "Wallet" SET balance = balance + p_amount, "updatedAt" = NOW()
    WHERE "userId" = p_user_id
    RETURNING id, balance INTO v_wallet_id, v_new_balance;

    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    INSERT INTO "Transaction" (
        "walletId", 
        amount, 
        type, 
        description, 
        "balanceAfter",
        "isTest",
        "createdAt"
    ) VALUES (
        v_wallet_id, 
        ABS(p_amount), 
        (CASE WHEN p_amount > 0 THEN 'CREDIT' ELSE 'DEBIT' END)::"TransactionType", 
        'Admin Adjustment: ' || p_reason || ' (by ' || p_admin_id || ')', 
        v_new_balance,
        FALSE,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FIXED process_purchase (Manually generating Order UUID)
CREATE OR REPLACE FUNCTION process_purchase(p_user_id TEXT, p_purchases JSONB)
RETURNS JSONB AS $$
DECLARE
    v_total_cost NUMERIC := 0;
    v_user_balance NUMERIC;
    v_wallet_id TEXT;
    v_purchase RECORD;
    v_unit_id TEXT;
    v_order_id TEXT;
    v_unit_count INTEGER := 0;
    v_new_balance NUMERIC;
    v_sub_price NUMERIC;
BEGIN
    -- 1. Check user balance and lock wallet
    SELECT id, balance INTO v_wallet_id, v_user_balance FROM "Wallet" WHERE "userId" = p_user_id FOR UPDATE;
    
    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Vault balance check failed: Wallet not initialized for user %', p_user_id;
    END IF;

    -- 2. Calculate total cost and check availability
    FOR v_purchase IN SELECT * FROM jsonb_to_recordset(p_purchases) AS x("subcategoryId" TEXT, quantity INTEGER)
    LOOP
        SELECT price INTO v_sub_price FROM "Subcategory" WHERE id = v_purchase."subcategoryId";
        
        IF v_sub_price IS NULL THEN
            RAISE EXCEPTION 'Invalid request: Sector ID % not found', v_purchase."subcategoryId";
        END IF;

        v_total_cost := v_total_cost + (v_sub_price * v_purchase.quantity);
        
        IF (SELECT count(*) FROM "AssetUnit" WHERE "subcategoryId" = v_purchase."subcategoryId" AND status = 'AVAILABLE'::"UnitStatus") < v_purchase.quantity THEN
            RAISE EXCEPTION 'Insufficient stock in terminal: % requested, but less available in sector %', v_purchase.quantity, v_purchase."subcategoryId";
        END IF;
    END LOOP;

    IF v_user_balance < v_total_cost THEN
        RAISE EXCEPTION 'Insufficient wallet balance. Transaction requires %, but vault only holds %', v_total_cost, v_user_balance;
    END IF;

    -- 3. Deduct balance
    UPDATE "Wallet" SET balance = balance - v_total_cost, "updatedAt" = NOW() WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;

    -- 4. CREATE ORDER RECORD (Giving it a manual ID)
    v_order_id := gen_random_uuid()::TEXT;
    INSERT INTO "Order" (id, "userId", "totalAmount", "createdAt")
    VALUES (v_order_id, p_user_id, v_total_cost, NOW());

    -- 5. Create Transaction record
    INSERT INTO "Transaction" ("walletId", amount, type, description, "balanceAfter", "createdAt")
    VALUES (v_wallet_id, v_total_cost, 'DEBIT'::"TransactionType", 'Asset Purchase', v_new_balance, NOW());

    -- 6. Allocate units and grant access
    FOR v_purchase IN SELECT * FROM jsonb_to_recordset(p_purchases) AS x("subcategoryId" TEXT, quantity INTEGER)
    LOOP
        FOR i IN 1..v_purchase.quantity
        LOOP
            -- Find next available unit
            SELECT id INTO v_unit_id FROM "AssetUnit" 
            WHERE "subcategoryId" = v_purchase."subcategoryId" AND status = 'AVAILABLE'::"UnitStatus"
            LIMIT 1 FOR UPDATE SKIP LOCKED;

            IF v_unit_id IS NOT NULL THEN
                -- Update unit
                UPDATE "AssetUnit" 
                SET status = 'SOLD'::"UnitStatus", 
                    "purchasedById" = p_user_id, 
                    "purchasedAt" = NOW(), 
                    "orderId" = v_order_id
                WHERE id = v_unit_id;

                -- Record access
                INSERT INTO "AssetAccess" ("userId", "assetUnitId", "orderId", "grantedAt")
                VALUES (p_user_id, v_unit_id, v_order_id, NOW());
                
                v_unit_count := v_unit_count + 1;
            END IF;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('orderId', v_order_id, 'unitCount', v_unit_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
