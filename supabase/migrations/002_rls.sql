-- ============================================================
-- 002_rls.sql — Row Level Security Policies
-- Run this AFTER 001_init.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports       ENABLE ROW LEVEL SECURITY;

-- NOTE: Since we're using custom JWT auth (not Supabase Auth),
-- RLS policies below are designed to be enforced at the
-- application layer (service role bypasses RLS).
-- These policies apply if you switch to Supabase Auth later.

-- ─── Profiles Policies ────────────────────────────────────────
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─── Listings Policies ────────────────────────────────────────
CREATE POLICY "listings_select_active"
  ON listings FOR SELECT USING (status = 'active');

CREATE POLICY "listings_select_own"
  ON listings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "listings_insert_authenticated"
  ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings_update_own"
  ON listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "listings_delete_own"
  ON listings FOR DELETE USING (auth.uid() = user_id);

-- ─── Listing Images Policies ──────────────────────────────────
CREATE POLICY "listing_images_select_all"
  ON listing_images FOR SELECT USING (true);

CREATE POLICY "listing_images_insert_own"
  ON listing_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
        AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "listing_images_delete_own"
  ON listing_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
        AND listings.user_id = auth.uid()
    )
  );

-- ─── Bookmarks Policies ───────────────────────────────────────
CREATE POLICY "bookmarks_select_own"
  ON bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert_own"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks_delete_own"
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ─── Reports Policies ─────────────────────────────────────────
CREATE POLICY "reports_insert_authenticated"
  ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_own"
  ON reports FOR SELECT USING (auth.uid() = reporter_id);
