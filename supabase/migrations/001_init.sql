-- ============================================================
-- 001_init.sql — Cragialist Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- for fast text search

-- ─── Profiles ─────────────────────────────────────────────────
-- Extends auth.users for when using Supabase Auth
-- OR serves as a standalone users table with password_hash for custom JWT auth
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT UNIQUE NOT NULL,
  username     TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ─── Categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,
  slug  TEXT UNIQUE NOT NULL,
  icon  TEXT
);

-- ─── Listings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 150),
  description TEXT CHECK (char_length(description) <= 5000),
  price       NUMERIC(10, 2) CHECK (price >= 0),
  location    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'pending', 'rejected', 'sold')),
  views       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_listings_title_search ON listings USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);

-- ─── Listing Images ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);

-- ─── Bookmarks ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- ─── Reports ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 500),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ─── Utility Function: Auto-update updated_at ─────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Utility Function: Increment View Count ───────────────────
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE listings SET views = views + 1 WHERE id = listing_id;
END;
$$;
