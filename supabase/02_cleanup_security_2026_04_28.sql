-- ============================================================
-- HOMEIZZ DATABASE CLEANUP & SECURITY MIGRATION
-- Date: 2026-04-28
-- Fixes: duplicate tables, broken handle_new_user trigger,
--        permissive RLS, missing FK indexes, insecure storage.
-- ============================================================

-- 1. DROP duplicate inquiries table (code uses 'enquiries')
DROP TABLE IF EXISTS public.inquiries CASCADE;

-- 2. FIX broken handle_new_user function
--    (was referencing columns that don't exist in profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, user_type, plan)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', NEW.raw_user_meta_data->>'user_type', 'homeowner'),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'growth')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. FK INDEXES (performance)
CREATE INDEX IF NOT EXISTS idx_enquiries_homeowner_id    ON public.enquiries(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_listing_id      ON public.enquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_professional_id ON public.enquiries(professional_id);
CREATE INDEX IF NOT EXISTS idx_listings_owner_id         ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_user_id          ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_listing_id ON public.saved_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id    ON public.saved_listings(user_id);

-- 4. PROFILES RLS — drop duplicates, recreate clean
DROP POLICY IF EXISTS "Users can manage own profile"        ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"        ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"        ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;

CREATE POLICY "profiles_public_read"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_insert" ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "profiles_owner_update" ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "profiles_owner_delete" ON public.profiles FOR DELETE USING ((select auth.uid()) = id);

-- 5. LISTINGS RLS — drop duplicates, recreate clean
DROP POLICY IF EXISTS "Anyone can view listings"      ON public.listings;
DROP POLICY IF EXISTS "Anyone can view live listings" ON public.listings;
DROP POLICY IF EXISTS "Users manage own listings"     ON public.listings;

CREATE POLICY "listings_public_read_live" ON public.listings FOR SELECT USING (
  status = 'live'
  OR (select auth.uid()) = user_id
  OR (select auth.uid()) = owner_id
);
CREATE POLICY "listings_owner_insert" ON public.listings FOR INSERT WITH CHECK (
  (select auth.uid()) = user_id OR (select auth.uid()) = owner_id
);
CREATE POLICY "listings_owner_update" ON public.listings FOR UPDATE
  USING ((select auth.uid()) = user_id OR (select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = user_id OR (select auth.uid()) = owner_id);
CREATE POLICY "listings_owner_delete" ON public.listings FOR DELETE USING (
  (select auth.uid()) = user_id OR (select auth.uid()) = owner_id
);

-- 6. ENQUIRIES RLS — drop duplicates, recreate clean
DROP POLICY IF EXISTS "Anyone can insert enquiry"            ON public.enquiries;
DROP POLICY IF EXISTS "anyone_can_insert_enquiry"            ON public.enquiries;
DROP POLICY IF EXISTS "Homeowners view own enquiries"        ON public.enquiries;
DROP POLICY IF EXISTS "Professionals view own enquiries"     ON public.enquiries;
DROP POLICY IF EXISTS "professionals_view_own_enquiries"     ON public.enquiries;

-- Public lead form: anyone can submit; can't impersonate a logged-in user
CREATE POLICY "enquiries_public_insert" ON public.enquiries FOR INSERT WITH CHECK (
  homeowner_id IS NULL OR homeowner_id = (select auth.uid())
);
CREATE POLICY "enquiries_participants_select" ON public.enquiries FOR SELECT USING (
  (select auth.uid()) = homeowner_id OR (select auth.uid()) = professional_id
);
CREATE POLICY "enquiries_pro_update" ON public.enquiries FOR UPDATE
  USING ((select auth.uid()) = professional_id)
  WITH CHECK ((select auth.uid()) = professional_id);

-- 7. SAVED_LISTINGS RLS — split ALL into specific SELECT/INSERT/DELETE
DROP POLICY IF EXISTS "Users manage own saved" ON public.saved_listings;

CREATE POLICY "saved_listings_owner_select" ON public.saved_listings FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "saved_listings_owner_insert" ON public.saved_listings FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "saved_listings_owner_delete" ON public.saved_listings FOR DELETE USING ((select auth.uid()) = user_id);

-- 8. STORAGE — listings bucket: drop permissive policies, restrict to owner-folder
DROP POLICY IF EXISTS "Anyone can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing images"   ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images"      ON storage.objects;

-- Note: bucket is PUBLIC -> object URLs still work without a SELECT policy.
-- Owner-folder pattern: files stored at "{auth.uid}/filename.jpg"
CREATE POLICY "listings_storage_owner_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'listings'
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);
CREATE POLICY "listings_storage_owner_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'listings'
  AND (select auth.uid()) IS NOT NULL
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);
CREATE POLICY "listings_storage_owner_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'listings'
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);
CREATE POLICY "listings_storage_owner_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'listings'
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);
