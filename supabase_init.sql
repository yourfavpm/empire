-- Supabase Initialization SQL
-- Copy and paste this into your Supabase SQL Editor

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Set ID Defaults for All Tables
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Wallet" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Category" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Subcategory" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "AssetUnit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Transaction" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Payment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Message" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "AssetAccess" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- 3. Set Timestamp Defaults
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

ALTER TABLE "Wallet" ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE "Wallet" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

ALTER TABLE "Category" ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE "Category" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

ALTER TABLE "Subcategory" ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE "Subcategory" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

ALTER TABLE "AssetUnit" ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE "AssetUnit" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

ALTER TABLE "Transaction" ALTER COLUMN "createdAt" SET DEFAULT NOW();

ALTER TABLE "Payment" ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

ALTER TABLE "Message" ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- 4. Set Functional Defaults
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'BUYER';
ALTER TABLE "AssetUnit" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
ALTER TABLE "Wallet" ALTER COLUMN "balance" SET DEFAULT 0;
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "AssetAccess" ALTER COLUMN "grantedAt" SET DEFAULT NOW();

-- 5. Atomic RPC Functions

-- RPC: Get Admin Stats
DROP FUNCTION IF EXISTS get_admin_stats();
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalBuyers', (SELECT count(*) FROM "User" WHERE role = 'BUYER'),
        'totalUnits', (SELECT count(*) FROM "AssetUnit"),
        'availableUnits', (SELECT count(*) FROM "AssetUnit" WHERE status = 'AVAILABLE'),
        'totalPaymentsCount', (SELECT count(*) FROM "Payment"),
        'pendingCryptoPayments', (SELECT count(*) FROM "Payment" WHERE type = 'CRYPTO' AND status = 'PENDING'),
        'totalRevenue', (SELECT COALESCE(sum(amount), 0) FROM "Payment" WHERE status = 'VERIFIED' OR status = 'APPROVED'),
        'recentPayments', (
            SELECT COALESCE(jsonb_agg(p), '[]'::jsonb) FROM (
                SELECT p.id, p.amount, p.type, p.status, p."createdAt", 
                jsonb_build_object('name', u.name, 'email', u.email) as user
                FROM "Payment" p
                JOIN "User" u ON p."userId" = u.id
                ORDER BY p."createdAt" DESC
                LIMIT 5
            ) p
        ),
        'recentUnlocks', (
            SELECT COALESCE(jsonb_agg(a), '[]'::jsonb) FROM (
                SELECT acc.id, acc."grantedAt",
                jsonb_build_object('name', u.name) as user,
                jsonb_build_object('title', sub.title, 'price', sub.price) as asset
                FROM "AssetAccess" acc
                JOIN "User" u ON acc."userId" = u.id
                JOIN "Subcategory" sub ON acc."subcategoryId" = sub.id
                ORDER BY acc."grantedAt" DESC
                LIMIT 5
            ) a
        )
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Process Purchase (Atomic)
DROP FUNCTION IF EXISTS process_purchase(TEXT, JSONB);
CREATE OR REPLACE FUNCTION process_purchase(p_user_id TEXT, p_purchases JSONB)
RETURNS JSONB AS $$
DECLARE
    v_total_cost NUMERIC := 0;
    v_user_balance NUMERIC;
    v_purchase RECORD;
    v_unit_id TEXT;
    v_order_id TEXT;
    v_unit_count INTEGER := 0;
BEGIN
    -- Check user balance
    SELECT balance INTO v_user_balance FROM "Wallet" WHERE "userId" = p_user_id FOR UPDATE;
    
    -- Calculate total cost and check availability
    FOR v_purchase IN SELECT * FROM jsonb_to_recordset(p_purchases) AS x(subcategoryId TEXT, quantity INTEGER)
    LOOP
        v_total_cost := v_total_cost + ((SELECT price FROM "Subcategory" WHERE id = v_purchase.subcategoryId) * v_purchase.quantity);
        
        IF (SELECT count(*) FROM "AssetUnit" WHERE "subcategoryId" = v_purchase.subcategoryId AND status = 'AVAILABLE') < v_purchase.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for some items';
        END IF;
    END LOOP;

    IF v_user_balance < v_total_cost THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    -- Deduct balance
    UPDATE "Wallet" SET balance = balance - v_total_cost WHERE "userId" = p_user_id;

    -- Create Transaction record
    INSERT INTO "Transaction" ("userId", amount, type, status, description)
    VALUES (p_user_id, v_total_cost, 'DEBIT', 'COMPLETED', 'Asset Purchase')
    RETURNING id INTO v_order_id;

    -- Allocate units and grant access
    FOR v_purchase IN SELECT * FROM jsonb_to_recordset(p_purchases) AS x(subcategoryId TEXT, quantity INTEGER)
    LOOP
        FOR i IN 1..v_purchase.quantity
        LOOP
            SELECT id INTO v_unit_id FROM "AssetUnit" 
            WHERE "subcategoryId" = v_purchase.subcategoryId AND status = 'AVAILABLE' 
            LIMIT 1 FOR UPDATE SKIP LOCKED;

            UPDATE "AssetUnit" SET status = 'SOLD', "purchasedByUserId" = p_user_id, "purchasedAt" = NOW(), "orderId" = v_order_id
            WHERE id = v_unit_id;

            INSERT INTO "AssetAccess" ("userId", "subcategoryId", "grantedAt")
            VALUES (p_user_id, v_purchase.subcategoryId, NOW());
            
            v_unit_count := v_unit_count + 1;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('orderId', v_order_id, 'unitCount', v_unit_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Handle Payment Success
DROP FUNCTION IF EXISTS handle_payment_success(TEXT, NUMERIC);
CREATE OR REPLACE FUNCTION handle_payment_success(p_reference TEXT, p_amount NUMERIC)
RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    UPDATE "Payment" SET status = 'VERIFIED', "updatedAt" = NOW()
    WHERE reference = p_reference AND status != 'VERIFIED'
    RETURNING "userId" INTO v_user_id;

    IF FOUND THEN
        UPDATE "Wallet" SET balance = balance + p_amount, "updatedAt" = NOW()
        WHERE "userId" = v_user_id;

        INSERT INTO "Transaction" ("userId", amount, type, status, description)
        VALUES (v_user_id, p_amount, 'CREDIT', 'COMPLETED', 'Wallet Funding (Paystack)');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Handle Crypto Approval
DROP FUNCTION IF EXISTS handle_crypto_approval(TEXT);
CREATE OR REPLACE FUNCTION handle_crypto_approval(p_payment_id TEXT)
RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_amount NUMERIC;
BEGIN
    UPDATE "Payment" SET status = 'APPROVED', "updatedAt" = NOW()
    WHERE id = p_payment_id AND status = 'PENDING'
    RETURNING "userId", amount INTO v_user_id, v_amount;

    IF FOUND THEN
        UPDATE "Wallet" SET balance = balance + v_amount, "updatedAt" = NOW()
        WHERE "userId" = v_user_id;

        INSERT INTO "Transaction" ("userId", amount, type, status, description)
        VALUES (v_user_id, v_amount, 'CREDIT', 'COMPLETED', 'Wallet Funding (Crypto)');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
