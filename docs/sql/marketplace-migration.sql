-- ============================================
-- MARKETPLACE MIGRATION
-- Run this in the Supabase SQL Editor AFTER
-- media-type-migration.sql has already been applied.
-- ============================================

-- ============================================
-- MARKETPLACE
-- Buy/sell listings. Trustworthy specifically because every seller
-- is a verified TTU student — unlike a general marketplace.
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('textbooks', 'electronics', 'housing', 'clothing', 'miscellaneous')),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sell', 'buy')),
    price NUMERIC(10, 2), -- nullable: "buy/want" requests don't need a price
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view marketplace listings"
    ON marketplace_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own listings"
    ON marketplace_items FOR INSERT
    TO authenticated
    WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Seller or admin can update a listing"
    ON marketplace_items FOR UPDATE
    TO authenticated
    USING (
        seller_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Seller or admin can delete a listing"
    ON marketplace_items FOR DELETE
    TO authenticated
    USING (
        seller_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
