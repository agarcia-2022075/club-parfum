-- ==============================================================================
-- CLUB PARFUM • SPRINT 2 MIGRATION (NON-DESTRUCTIVE & IDEMPOTENT)
-- Paiements Stripe, Facturation Séquentielle, Stock Atomique, Point Relais & Rétractation
-- ==============================================================================

-- 1. Stock numérique par variante sur product_variants
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 25;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_variants_stock_quantity_check'
      AND conrelid = 'public.product_variants'::regclass
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_stock_quantity_check CHECK (stock_quantity >= 0);
  END IF;
END $$;

UPDATE public.product_variants
SET stock_quantity = 0
WHERE in_stock = false AND stock_quantity > 0;

-- 2. Colonnes Stripe, Facturation, Point Relais & Preuve CGV sur orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS relay_point_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cgv_accepted BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cgv_accepted_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_key
  ON public.orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_invoice_number_key
  ON public.orders (invoice_number)
  WHERE invoice_number IS NOT NULL;

-- 3. Séquences sans sauts (conformité comptable française) & Fonctions RPC
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('public.order_number_seq');
  RETURN 'CP-' || to_char(NOW(), 'YYYY') || '-' || lpad(seq_val::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('public.invoice_number_seq');
  RETURN 'FA-' || to_char(NOW(), 'YYYY') || '-' || lpad(seq_val::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_variant_stock(p_variant_id TEXT, p_qty INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_qty INTEGER;
BEGIN
  UPDATE public.product_variants
  SET
    stock_quantity = GREATEST(0, stock_quantity - GREATEST(0, p_qty)),
    in_stock = (GREATEST(0, stock_quantity - GREATEST(0, p_qty)) > 0)
  WHERE id = p_variant_id
  RETURNING stock_quantity INTO new_qty;

  RETURN COALESCE(new_qty, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.next_order_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_order_number() TO service_role;

REVOKE ALL ON FUNCTION public.next_invoice_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_invoice_number() TO service_role;

REVOKE ALL ON FUNCTION public.decrement_variant_stock(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_variant_stock(TEXT, INTEGER) TO service_role;

-- 4. Table des demandes de rétractation (Code de la consommation L.221-18)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  reason TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 5. Fermeture de la faille de fraude tarifaire sur orders
-- Toutes les commandes sont créées exclusivement côté serveur via /api/checkout/session (service_role)
DROP POLICY IF EXISTS "Insertion commande client anonyme" ON public.orders;
