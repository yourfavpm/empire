-- UPDATED ADMIN DASHBOARD STATISTICS
-- Run this in Supabase SQL Editor

DROP FUNCTION IF EXISTS get_admin_daily_stats();
DROP FUNCTION IF EXISTS get_top_customers();

-- 1. Detailed Daily Metrics
CREATE OR REPLACE FUNCTION get_admin_daily_stats()
RETURNS TABLE (
    total_users BIGINT,
    total_blocked_users BIGINT,
    total_revenue DECIMAL,
    total_wallet_recharge BIGINT,
    new_users_today BIGINT,
    recharged_today DECIMAL,
    revenue_today DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM "User")::BIGINT,
        (SELECT COUNT(*) FROM "User" WHERE blocked = true)::BIGINT,
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE type = 'DEBIT' AND (description LIKE 'Purchase%' OR description LIKE 'Order%' OR description LIKE 'Asset%')), 0)::DECIMAL,
        (SELECT COUNT(*) FROM "Transaction" WHERE type = 'CREDIT')::BIGINT,
        
        -- Daily Stats (Force 24h window)
        (SELECT COUNT(*) FROM "User" WHERE "createdAt" >= (NOW() - INTERVAL '24 hours'))::BIGINT,
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE type = 'CREDIT' AND "createdAt" >= (NOW() - INTERVAL '24 hours')), 0)::DECIMAL,
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE type = 'DEBIT' AND "createdAt" >= (NOW() - INTERVAL '24 hours') AND (description LIKE 'Purchase%' OR description LIKE 'Order%' OR description LIKE 'Asset%')), 0)::DECIMAL;
END;
$$ LANGUAGE plpgsql;

-- 2. Top Customers Leaderboard
CREATE OR REPLACE FUNCTION get_top_customers()
RETURNS TABLE (
    name TEXT,
    email TEXT,
    country TEXT,
    total_spent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.name, 
        u.email, 
        u.country, 
        COALESCE(SUM(t.amount), 0) as total_spent
    FROM "User" u
    JOIN "Transaction" t ON u.id = t.userid::TEXT -- Using standardized lowercase userid
    WHERE t.type = 'DEBIT' 
    AND (t.description LIKE 'Purchase%' OR t.description LIKE 'Order%' OR t.description LIKE 'Asset%')
    GROUP BY u.id, u.name, u.email, u.country
    ORDER BY total_spent DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;
