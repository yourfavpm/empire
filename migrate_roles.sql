-- Migrate generic ADMIN role to SUPER_ADMIN
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE role = 'ADMIN';

-- Ensure the 'blocked' column exists if not already present
-- (NextAuth and our logic use it)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='blocked') THEN
        ALTER TABLE "User" ADD COLUMN blocked BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
