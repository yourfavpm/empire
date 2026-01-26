
-- Create SystemSettings table for key-value configuration
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "key" TEXT PRIMARY KEY,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default referral bonus if not exists
INSERT INTO "SystemSettings" ("key", "value", "description")
VALUES ('referral_bonus_amount', '500', 'Amount credited to referrer when referee makes a qualifying action')
ON CONFLICT ("key") DO NOTHING;

-- RPC to get user referral stats
CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS TABLE (
    total_referrals BIGINT,
    total_earned DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM "User" WHERE "referrerId" = p_user_id::text) as total_referrals,
        COALESCE((
            SELECT SUM(amount) 
            FROM "Transaction" 
            WHERE "userId" = p_user_id::text 
            AND "type" = 'CREDIT' 
            AND "description" LIKE 'Referral Bonus%'
        ), 0) as total_earned;
END;
$$ LANGUAGE plpgsql;
