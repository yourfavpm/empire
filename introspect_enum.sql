CREATE OR REPLACE FUNCTION introspect_asset_status_enum()
RETURNS TABLE (enum_value TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT t.enumlabel::TEXT
    FROM pg_enum t
    JOIN pg_type ty ON t.enumtypid = ty.oid
    WHERE ty.typname = 'AssetStatus';
END;
$$ LANGUAGE plpgsql;
