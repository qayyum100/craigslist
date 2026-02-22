-- ============================================================
-- seed.sql — Initial Data Seed
-- Run this after the migrations
-- ============================================================

-- ─── Categories ───────────────────────────────────────────────
INSERT INTO categories (name, slug, icon) VALUES
  ('For Sale',        'for-sale',        '🛍️'),
  ('Housing',         'housing',         '🏠'),
  ('Jobs',            'jobs',            '💼'),
  ('Services',        'services',        '🔧'),
  ('Community',       'community',       '🤝'),
  ('Electronics',     'electronics',     '💻'),
  ('Vehicles',        'vehicles',        '🚗'),
  ('Furniture',       'furniture',       '🛋️'),
  ('Clothing',        'clothing',        '👗'),
  ('Books & Media',   'books-media',     '📚'),
  ('Sports & Fitness','sports-fitness',  '⚽'),
  ('Free Stuff',      'free-stuff',      '🎁'),
  ('Pets',            'pets',            '🐾'),
  ('Musical Instruments', 'musical-instruments', '🎸')
ON CONFLICT (slug) DO NOTHING;

-- ─── Supabase Storage Bucket ──────────────────────────────────
-- Run this separately in Supabase Storage UI or via API:
-- Create a bucket named "listings" with public access enabled

-- ─── Admin User Note ─────────────────────────────────────────
-- To create an admin, register normally then run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
