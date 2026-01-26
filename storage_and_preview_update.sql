
-- Add previewType column
ALTER TABLE "Subcategory" ADD COLUMN IF NOT EXISTS "previewType" TEXT DEFAULT 'URL';

-- Create Storage Bucket 'assets' if not exists (This usually requires API/Dashboard, but we can try SQL extension or just assume/instruct user. 
-- Standard Supabase SQL for storage:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'assets' );

-- Policy to allow authenticated upload (Admin only ideally, but for now authenticated)
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'assets' );

-- Policy for update/delete
CREATE POLICY "Authenticated Update" 
ON storage.objects FOR UPDATE
TO authenticated 
USING ( bucket_id = 'assets' );

CREATE POLICY "Authenticated Delete" 
ON storage.objects FOR DELETE
TO authenticated 
USING ( bucket_id = 'assets' );
