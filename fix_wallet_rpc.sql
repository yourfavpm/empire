
-- Drop old function
DROP FUNCTION IF EXISTS admin_adjust_wallet(uuid, numeric, uuid, text);
DROP FUNCTION IF EXISTS admin_adjust_wallet(text, numeric, text, text);

-- Recreate with quoted identifiers for case sensitivity
CREATE OR REPLACE FUNCTION admin_adjust_wallet(
    p_user_id TEXT,
    p_amount DECIMAL,
    p_admin_id TEXT,
    p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Update Wallet Balance
    UPDATE "Wallet"
    SET balance = balance + p_amount,
        "updatedAt" = now()
    WHERE "userId" = p_user_id;

    -- Record Transaction
    INSERT INTO "Transaction" (
        "userId",
        type,
        amount,
        description,
        status,
        "createdAt",
        "updatedAt"
    ) VALUES (
        p_user_id,
        CASE WHEN p_amount >= 0 THEN 'CREDIT' ELSE 'DEBIT' END,
        ABS(p_amount),
        'Admin Adjustment: ' || p_reason,
        'COMPLETED',
        now(),
        now()
    );
END;
$$ LANGUAGE plpgsql;
