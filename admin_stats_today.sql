
-- Update or create the admin stats RPC to include daily metrics

CREATE OR REPLACE FUNCTION get_detailed_admin_stats()
RETURNS TABLE (
    total_users BIGINT,
    total_assets BIGINT,
    total_orders BIGINT,
    total_revenue DECIMAL,
    new_users_today BIGINT,
    recharged_today DECIMAL,
    revenue_today DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM "User"),
        (SELECT COUNT(*) FROM "AssetUnit" WHERE status = 'AVAILABLE'),
        (SELECT COUNT(*) FROM "AssetUnit" WHERE status = 'SOLD'), -- total_orders approximation or use Transaction count
        COALESCE((SELECT SUM(price) FROM "Subcategory" s JOIN "AssetUnit" au ON s.id = au."subcategoryId" WHERE au.status = 'SOLD'), 0),
        
        -- Daily Stats
        (SELECT COUNT(*) FROM "User" WHERE "createdAt" >= CURRENT_DATE),
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE "type" = 'CREDIT' AND "createdAt" >= CURRENT_DATE), 0),
        COALESCE((SELECT SUM(amount) FROM "Transaction" WHERE "type" = 'DEBIT' AND "createdAt" >= CURRENT_DATE AND ("description" LIKE 'Purchase%' OR "description" LIKE 'Order%')), 0); -- Adjust description filter based on actual data
END;
$$ LANGUAGE plpgsql;
