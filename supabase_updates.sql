-- Migration V2: Production Updates
-- Run this in the Supabase SQL Editor

-- 1. Updates to "User" table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "blocked" BOOLEAN DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referrerId" TEXT REFERENCES "User"(id);

-- 2. Updates to "Subcategory" table
ALTER TABLE "Subcategory" ADD COLUMN IF NOT EXISTS "tutorialLink" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN IF NOT EXISTS "logo" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN IF NOT EXISTS "previewLink" TEXT;

-- 3. Updates to "Transaction" table
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "isTest" BOOLEAN DEFAULT FALSE;

-- 4. Create "Banner" table
CREATE TABLE IF NOT EXISTS "Banner" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "content" TEXT NOT NULL,
    "link" TEXT,
    "active" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create "PromoCode" table
CREATE TABLE IF NOT EXISTS "PromoCode" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "code" TEXT UNIQUE NOT NULL,
    "discountPercent" NUMERIC NOT NULL,
    "maxUses" INTEGER,
    "currentUses" INTEGER DEFAULT 0,
    "expiryDate" TIMESTAMP WITH TIME ZONE,
    "active" BOOLEAN DEFAULT TRUE,
    "campaignName" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RPC to Adjust Wallet Balance (Admin Only)
CREATE OR REPLACE FUNCTION admin_adjust_wallet(p_user_id TEXT, p_amount NUMERIC, p_admin_id TEXT, p_reason TEXT)
RETURNS VOID AS $$
DECLARE
    v_old_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    SELECT balance INTO v_old_balance FROM "Wallet" WHERE "userId" = p_user_id FOR UPDATE;
    
    UPDATE "Wallet" SET balance = balance + p_amount, "updatedAt" = NOW()
    WHERE "userId" = p_user_id
    RETURNING balance INTO v_new_balance;

    -- Log transaction with admin note
    INSERT INTO "Transaction" ("userId", amount, type, status, description, "isTest")
    VALUES (p_user_id, ABS(p_amount), CASE WHEN p_amount > 0 THEN 'CREDIT' ELSE 'DEBIT' END, 'COMPLETED', 'Admin Adjustment: ' || p_reason || ' (by ' || p_admin_id || ')', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC to Block/Unblock User
CREATE OR REPLACE FUNCTION toggle_user_block(p_user_id TEXT, p_block_status BOOLEAN)
RETURNS VOID AS $$
BEGIN
    UPDATE "User" SET "blocked" = p_block_status, "updatedAt" = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Updated Admin Stats RPC (More Analytics)
CREATE OR REPLACE FUNCTION get_detailed_admin_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalUsers', (SELECT count(*) FROM "User"),
        'totalBlockedUsers', (SELECT count(*) FROM "User" WHERE blocked = TRUE),
        'totalRevenue', (SELECT COALESCE(sum(amount), 0) FROM "Payment" WHERE status = 'VERIFIED' OR status = 'APPROVED'),
        'totalWalletRecharge', (SELECT COALESCE(sum(amount), 0) FROM "Transaction" WHERE type = 'CREDIT' AND description LIKE 'Wallet Funding%'),
        'topCustomers', (
             SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
                SELECT u.name, u.email, u.country, sum(p.amount) as total_spent
                FROM "Payment" p
                JOIN "User" u ON p."userId" = u.id
                WHERE p.status IN ('VERIFIED', 'APPROVED')
                GROUP BY u.id, u.name, u.email, u.country
                ORDER BY total_spent DESC
                LIMIT 10
             ) t
        )
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
