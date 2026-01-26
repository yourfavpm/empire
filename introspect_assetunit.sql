CREATE OR REPLACE FUNCTION introspect_assetunit_table()
RETURNS TABLE (column_name TEXT, data_type TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cols.column_name::TEXT, 
        cols.data_type::TEXT
    FROM information_schema.columns cols
    WHERE table_name = 'AssetUnit';
END;
$$ LANGUAGE plpgsql;
