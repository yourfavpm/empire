CREATE OR REPLACE FUNCTION introspect_asset_status_fixed()
RETURNS TABLE (enum_name TEXT, enum_value TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ty.typname::TEXT as enum_name,
        e.enumlabel::TEXT as enum_value
    FROM pg_type ty
    JOIN pg_enum e ON ty.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = ty.typnamespace
    WHERE ty.typname IN (
        SELECT udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'AssetUnit' AND column_name = 'status'
    );
END;
$$ LANGUAGE plpgsql;
