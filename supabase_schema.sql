-- COMPREHENSIVE SUPABASE SCHEMA FOR DIGITAL ASSET MARKETPLACE
-- This script creates all necessary tables and functions.
-- Run this in the Supabase SQL Editor.

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'BUYER',
    image TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Wallet" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
    balance NUMERIC DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Category" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Subcategory" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "categoryId" TEXT REFERENCES "Category"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT,
    features JSONB DEFAULT '[]'::JSONB,
    "publicDescription" TEXT,
    countries TEXT[] DEFAULT '{}'::TEXT[],
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AssetUnit" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "subcategoryId" TEXT REFERENCES "Subcategory"(id) ON DELETE CASCADE,
    "lockedDescription" TEXT NOT NULL,
    status TEXT DEFAULT 'AVAILABLE',
    "purchasedByUserId" TEXT REFERENCES "User"(id),
    "purchasedAt" TIMESTAMP WITH TIME ZONE,
    "orderId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Transaction" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL, -- 'CREDIT', 'DEBIT'
    status TEXT DEFAULT 'COMPLETED',
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Payment" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL, -- 'PAYSTACK', 'CRYPTO'
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'
    reference TEXT UNIQUE,
    "proofImage" TEXT,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Message" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "isAdmin" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AssetAccess" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    "subcategoryId" TEXT REFERENCES "Subcategory"(id) ON DELETE CASCADE,
    "grantedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Functions & RPCs

-- RPC: Get Admin Stats
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
