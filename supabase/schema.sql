-- ============================================================
-- KANADA 2026 – Supabase Database Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- STATIONS
-- One record per travel stop (Vancouver, Whistler, etc.)
-- ============================================================
CREATE TABLE stations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  subtitle      TEXT,
  description   TEXT,
  location_name TEXT,
  lat           DECIMAL(9, 6),
  lng           DECIMAL(9, 6),
  date_start    DATE,
  date_end      DATE,
  cover_image_url TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stations_updated_at
  BEFORE UPDATE ON stations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- POSTS (travel reports per station)
-- ============================================================
CREATE TABLE posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id    UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT,          -- Markdown / rich text
  is_published  BOOLEAN NOT NULL DEFAULT false,
  published_at  TIMESTAMPTZ,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_station ON posts(station_id);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- PHOTOS
-- ============================================================
CREATE TABLE photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id    UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  post_id       UUID REFERENCES posts(id) ON DELETE SET NULL,
  storage_path  TEXT NOT NULL,   -- path in Supabase Storage bucket
  url           TEXT NOT NULL,   -- public CDN url
  caption       TEXT,
  alt_text      TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_station ON photos(station_id);
CREATE INDEX idx_photos_post    ON photos(post_id);


-- ============================================================
-- EMAIL WHITELIST
-- Only server-side code may read/write this table
-- ============================================================
CREATE TABLE whitelist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  note       TEXT,
  added_by   TEXT,             -- admin email who added this entry
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- REACTIONS  (👍 ❤️ 😂 😮)
-- ============================================================
CREATE TYPE reaction_type AS ENUM ('like', 'heart', 'haha', 'wow');

CREATE TABLE reactions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- one reaction per type per user per station
  UNIQUE (station_id, user_id, type)
);

CREATE INDEX idx_reactions_station ON reactions(station_id);
CREATE INDEX idx_reactions_user    ON reactions(user_id);


-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  is_hidden  BOOLEAN NOT NULL DEFAULT false,  -- admin moderation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_station ON comments(station_id);
CREATE INDEX idx_comments_user    ON comments(user_id);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- PRIVATE AREA – BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'other',  -- flight, hotel, activity, transport, other
  station_id          UUID REFERENCES stations(id) ON DELETE SET NULL,
  booking_date        DATE,
  checkin_date        DATE,
  checkout_date       DATE,
  confirmation_number TEXT,
  provider            TEXT,
  amount              DECIMAL(10, 2),
  currency            TEXT NOT NULL DEFAULT 'CAD',
  notes               TEXT,
  document_url        TEXT,  -- link to uploaded PDF/screenshot
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- PRIVATE AREA – BUDGET
-- ============================================================
CREATE TABLE budget_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category    TEXT NOT NULL,  -- accommodation, food, transport, activities, shopping, misc
  description TEXT NOT NULL,
  amount      DECIMAL(10, 2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'CAD',
  item_date   DATE,
  is_planned  BOOLEAN NOT NULL DEFAULT true,  -- planned vs. actual expense
  station_id  UUID REFERENCES stations(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER budget_items_updated_at
  BEFORE UPDATE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- PRIVATE AREA – PACKING LIST
-- ============================================================
CREATE TABLE packing_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category   TEXT NOT NULL,   -- clothing, electronics, documents, hygiene, misc
  item       TEXT NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 1,
  is_packed  BOOLEAN NOT NULL DEFAULT false,
  notes      TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Helper function: is the current user an admin?
-- Admins are identified by their email in auth.users.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = ANY(
      STRING_TO_ARRAY(current_setting('app.admin_emails', true), ',')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: is the current user on the whitelist?
-- NOTE: whitelist checks are intentionally done server-side via service role.
-- This function is used only for RLS on reactions/comments.
CREATE OR REPLACE FUNCTION is_whitelisted()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM whitelist
    WHERE LOWER(email) = LOWER((
      SELECT email FROM auth.users WHERE id = auth.uid()
    ))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---- STATIONS ----
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stations_public_read"
  ON stations FOR SELECT
  USING (is_published = true);

CREATE POLICY "stations_admin_all"
  ON stations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- POSTS ----
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_public_read"
  ON posts FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM stations s
      WHERE s.id = station_id AND s.is_published = true
    )
  );

CREATE POLICY "posts_admin_all"
  ON posts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- PHOTOS ----
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_public_read"
  ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stations s
      WHERE s.id = station_id AND s.is_published = true
    )
  );

CREATE POLICY "photos_admin_all"
  ON photos FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- WHITELIST ----
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- No direct client access — service role only
-- (No SELECT/INSERT/UPDATE/DELETE policies = total lockdown for anon/auth roles)

-- ---- REACTIONS ----
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions_public_read"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "reactions_whitelisted_insert"
  ON reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_whitelisted()
  );

CREATE POLICY "reactions_own_delete"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ---- COMMENTS ----
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_public_read"
  ON comments FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "comments_whitelisted_insert"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_whitelisted()
  );

CREATE POLICY "comments_admin_all"
  ON comments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- BOOKINGS ----
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_admin_all"
  ON bookings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- BUDGET ITEMS ----
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_admin_all"
  ON budget_items FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- PACKING ITEMS ----
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packing_admin_all"
  ON packing_items FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());


-- ============================================================
-- STORAGE BUCKETS (run after enabling Storage in dashboard)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);


-- ============================================================
-- SEED DATA – Sample stations
-- ============================================================
INSERT INTO stations (slug, title, subtitle, location_name, lat, lng, date_start, date_end, sort_order, is_published)
VALUES
  ('vancouver',     'Vancouver',       'Willkommen in Kanada',        'Vancouver, BC',          49.2827, -123.1207, '2026-06-01', '2026-06-05', 1, false),
  ('whistler',      'Whistler',        'Berge & Abenteuer',           'Whistler, BC',           50.1163, -122.9574, '2026-06-05', '2026-06-08', 2, false),
  ('banff',         'Banff',           'Im Herz der Rockies',         'Banff, AB',              51.1784, -115.5708, '2026-06-08', '2026-06-13', 3, false),
  ('jasper',        'Jasper',          'Wildnis pur',                 'Jasper, AB',             52.8737, -118.0814, '2026-06-13', '2026-06-16', 4, false),
  ('toronto',       'Toronto',         'Die Millionenstadt',          'Toronto, ON',            43.6532, -79.3832,  '2026-06-16', '2026-06-20', 5, false),
  ('niagara-falls', 'Niagara Falls',   'Das Donnern des Wassers',     'Niagara Falls, ON',      43.0962, -79.0377,  '2026-06-20', '2026-06-21', 6, false),
  ('montreal',      'Montréal',        'Joie de vivre',               'Montréal, QC',           45.5017, -73.5673,  '2026-06-21', '2026-06-25', 7, false),
  ('quebec-city',   'Québec City',     'Das Paris Nordamerikas',      'Québec City, QC',        46.8139, -71.2080,  '2026-06-25', '2026-06-28', 8, false);
