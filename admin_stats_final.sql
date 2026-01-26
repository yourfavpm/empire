
-- RPC for Scalar Stats + Daily Metrics
CREATE OR REPLACE FUNCTION get_admin_daily_stats()
RETURNS TABLE (
    totalUsers BIGINT,
    totalBlockedUsers BIGINT,
    totalRevenue DECIMAL,
    totalWalletRecharge DECIMAL,
    new_users_today BIGINT,
    recharged_today DECIMAL,
    revenue_today DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM "User"),
        (SELECT COUNT(*) FROM "User" WHERE blocked = true),
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE "type" = 'DEBIT' AND ("description" LIKE 'Purchase%' OR "description" LIKE 'Order%')), 0),
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE "type" = 'CREDIT'), 0),
        
        -- Daily Stats (Using CURRENT_DATE which is start of day in server timezone, usually UTC)
        (SELECT COUNT(*) FROM "User" WHERE "createdAt" >= CURRENT_DATE),
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE "type" = 'CREDIT' AND "createdAt" >= CURRENT_DATE), 0),
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE "type" = 'DEBIT' AND "createdAt" >= CURRENT_DATE AND ("description" LIKE 'Purchase%' OR "description" LIKE 'Order%')), 0);
END;
$$ LANGUAGE plpgsql;

-- RPC for Top Customers
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
    JOIN "Transaction" t ON u.id = t."userId"::uuid
    WHERE t."type" = 'DEBIT' 
    AND (t."description" LIKE 'Purchase%' OR t."description" LIKE 'Order%')
    GROUP BY u.id, u.name, u.email, u.country
    ORDER BY total_spent DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;
