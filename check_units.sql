CREATE OR REPLACE FUNCTION check_raw_asset_units()
RETURNS TABLE (id TEXT, status_text TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id, 
        status::TEXT -- Cast the enum/type to text to see it
    FROM "AssetUnit"
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
