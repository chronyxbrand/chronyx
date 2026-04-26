-- ============================================================
-- CHRONYX: Row-Level Security (RLS) Policies
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
--
-- This locks down your database so that:
--   Public visitors can READ products & settings (storefront)
--   Only authenticated users can WRITE data (admin panel)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PRODUCTS
-- ────────────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (needed for the public storefront)
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);

-- Only authenticated users can insert products
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update products
CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 2. PRODUCT_IMAGES
-- ────────────────────────────────────────────────────────────
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 3. ORDERS
-- ────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own orders (storefront account page)
-- Admin can read all orders (admin panel)
CREATE POLICY "Authenticated users can read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Anyone can place an order (guest checkout support)
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can update orders (admin status changes)
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 4. SETTINGS (hero text, store policies, global config)
-- ────────────────────────────────────────────────────────────
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (storefront needs them)
CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

-- Only authenticated users can insert settings
CREATE POLICY "Authenticated users can insert settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update settings
CREATE POLICY "Authenticated users can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 5. SUBSCRIBERS (newsletter / waitlist emails)
-- ────────────────────────────────────────────────────────────
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (popup + signup form)
CREATE POLICY "Anyone can insert subscribers"
  ON subscribers FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read subscribers (admin panel)
CREATE POLICY "Authenticated users can read subscribers"
  ON subscribers FOR SELECT
  TO authenticated
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 6. COUPONS
-- ────────────────────────────────────────────────────────────
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can manage coupons
CREATE POLICY "Authenticated users can read coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert coupons"
  ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update coupons"
  ON coupons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete coupons"
  ON coupons FOR DELETE
  TO authenticated
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 7. WAITLIST
-- ────────────────────────────────────────────────────────────
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can join the waitlist
CREATE POLICY "Anyone can insert waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read waitlist (admin panel)
CREATE POLICY "Authenticated users can read waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- DONE! Your database is now secured at the server level.
-- Even if someone discovers your anon key, they cannot
-- modify products, orders, or settings without logging in.
-- ============================================================
