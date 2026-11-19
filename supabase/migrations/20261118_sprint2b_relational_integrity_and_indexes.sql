-- ==============================================================================
-- CLUB PARFUM • SPRINT 2B MIGRATION (ADDITIVE, NON-DESTRUCTIVE & IDEMPOTENT)
-- Assainissement, Intégrité Relationnelle Complète, Table order_items,
-- Politiques ON DELETE / ON UPDATE, Contraintes CHECK & Index de Performance
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ASSAINISSEMENT PRÉALABLE DES DONNÉES (Garantit 0 échec lors de la pose des FK / CHECK)
-- ------------------------------------------------------------------------------

-- 1.1 S'assurer que les 7 familles olfactives officielles existent dans public.olfactory_families
INSERT INTO public.olfactory_families (id, name, mood, description)
SELECT v.id, v.name, v.mood, v.description
FROM (
  VALUES
    ('fam-orientale', 'Orientale', 'Chaleureux & Envoûtant', 'Ambre doré, oud précieux, résines et épices douces.'),
    ('fam-boisee', 'Boisée', 'Noble & Apaisant', 'Cèdre de l''Atlas, santal, vétiver et sauge sclarée.'),
    ('fam-fleurie', 'Fleurie', 'Solaire & Lumineux', 'Fleur d''oranger de Grasse, rose centifolia, jasmin et néroli.'),
    ('fam-gourmande', 'Gourmande', 'Suave & Réconfortant', 'Vanille bourbon de Madagascar, fève tonka et notes miellées.'),
    ('fam-poudree', 'Poudrée', 'Doux & Cotonneux', 'Fleur de coton, iris pâle, musc blanc et héliotrope.'),
    ('fam-hesperidee', 'Hespéridée', 'Frais & Vivifiant', 'Bergamote de Calabre, mandarine, cédrat et petit-grain.'),
    ('fam-aromatique', 'Aromatique', 'Herbacé & Purifiant', 'Lavande fine de Provence, romarin, thym et eucalyptus.')
) AS v(id, name, mood, description)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.olfactory_families existing
  WHERE existing.name = v.name
)
ON CONFLICT (id) DO NOTHING;

-- 1.2 Normaliser les chaînes vides '' -> 'Orientale' sur customer_profiles.favorite_family et products.olfactory_family
UPDATE public.customer_profiles
SET favorite_family = 'Orientale'
WHERE favorite_family IS NOT NULL
  AND btrim(favorite_family) = '';

UPDATE public.customer_profiles
SET favorite_family = btrim(favorite_family)
WHERE favorite_family IS NOT NULL
  AND favorite_family <> btrim(favorite_family);

UPDATE public.products
SET olfactory_family = 'Orientale'
WHERE olfactory_family IS NULL
  OR btrim(olfactory_family) = '';

UPDATE public.products
SET olfactory_family = btrim(olfactory_family)
WHERE olfactory_family <> btrim(olfactory_family);

-- 1.3 Insérer dynamiquement toute famille olfactive existante dans products ou customer_profiles absente du référentiel
INSERT INTO public.olfactory_families (id, name, mood, description)
SELECT
  'fam-' || substr(md5(src.family_name), 1, 10),
  src.family_name,
  'Accord Signature de Grasse',
  'Famille olfactive synchronisée automatiquement lors de la migration relationnelle.'
FROM (
  SELECT DISTINCT olfactory_family AS family_name
  FROM public.products
  WHERE btrim(COALESCE(olfactory_family, '')) <> ''
  UNION
  SELECT DISTINCT favorite_family AS family_name
  FROM public.customer_profiles
  WHERE favorite_family IS NOT NULL
    AND btrim(favorite_family) <> ''
) AS src
WHERE NOT EXISTS (
  SELECT 1
  FROM public.olfactory_families existing
  WHERE existing.name = src.family_name
)
ON CONFLICT (id) DO NOTHING;

-- 1.4 Nettoyage défensif des éventuelles références orphelines et valeurs hors domaine
UPDATE public.products p
SET category_id = NULL
WHERE p.category_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.categories c WHERE c.id = p.category_id
  );

UPDATE public.orders o
SET shipping_method_id = NULL
WHERE o.shipping_method_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.shipping_methods sm WHERE sm.id = o.shipping_method_id
  );

UPDATE public.orders o
SET user_id = NULL
WHERE o.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = o.user_id
  );

UPDATE public.products
SET base_price = 0
WHERE base_price < 0;

UPDATE public.product_variants
SET price = 0
WHERE price < 0;

UPDATE public.shipping_methods
SET price = 0
WHERE price < 0;

UPDATE public.orders
SET
  subtotal = GREATEST(0, subtotal),
  shipping_cost = GREATEST(0, shipping_cost),
  total = GREATEST(0, total)
WHERE subtotal < 0 OR shipping_cost < 0 OR total < 0;

UPDATE public.orders
SET status = 'pending'
WHERE status IS NULL
  OR status NOT IN ('pending', 'shipped', 'delivered', 'cancelled');

UPDATE public.orders
SET payment_status = 'pending'
WHERE payment_status IS NULL
  OR payment_status NOT IN ('pending', 'paid', 'failed', 'expired', 'refunded');

UPDATE public.withdrawal_requests
SET status = 'received'
WHERE status IS NULL
  OR status NOT IN ('received', 'reviewing', 'approved', 'rejected', 'refunded');

-- ------------------------------------------------------------------------------
-- 2. CONNEXION DE L'ÎLE ORPHELINE #1 (olfactory_families -> products & customer_profiles)
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_olfactory_family_fkey'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_olfactory_family_fkey
      FOREIGN KEY (olfactory_family)
      REFERENCES public.olfactory_families(name)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customer_profiles_favorite_family_fkey'
      AND conrelid = 'public.customer_profiles'::regclass
  ) THEN
    ALTER TABLE public.customer_profiles
      ADD CONSTRAINT customer_profiles_favorite_family_fkey
      FOREIGN KEY (favorite_family)
      REFERENCES public.olfactory_families(name)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. CONNEXION DE L'ÎLE ORPHELINE #2 (withdrawal_requests -> orders)
-- ------------------------------------------------------------------------------

ALTER TABLE public.withdrawal_requests
  ADD COLUMN IF NOT EXISTS order_id TEXT;

UPDATE public.withdrawal_requests wr
SET order_id = o.id
FROM public.orders o
WHERE wr.order_id IS NULL
  AND lower(wr.order_number) = lower(o.order_number);

UPDATE public.withdrawal_requests wr
SET order_id = NULL
WHERE wr.order_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = wr.order_id
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'withdrawal_requests_order_id_fkey'
      AND conrelid = 'public.withdrawal_requests'::regclass
  ) THEN
    ALTER TABLE public.withdrawal_requests
      ADD CONSTRAINT withdrawal_requests_order_id_fkey
      FOREIGN KEY (order_id)
      REFERENCES public.orders(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. CONNEXION CATALOGUE <-> VENTES : CRÉATION DE public.order_items & BACKFILL JSONB
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL,
  variant_id TEXT REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL,
  sku TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL DEFAULT '',
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'order_items'
      AND policyname = 'Lecture lignes commandes propres client'
  ) THEN
    CREATE POLICY "Lecture lignes commandes propres client" ON public.order_items
      FOR SELECT USING (
        EXISTS (
          SELECT 1
          FROM public.orders o
          WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Backfill idempotent depuis public.orders.items (JSONB) pour les commandes sans lignes relationnelles
DO $$
BEGIN
  INSERT INTO public.order_items (
    id,
    order_id,
    product_id,
    variant_id,
    sku,
    product_name,
    variant_label,
    unit_price,
    quantity,
    total_price,
    created_at
  )
  SELECT
    o.id || '-item-' || item_row.ordinality::TEXT AS id,
    o.id AS order_id,
    (
      SELECT p.id
      FROM public.products p
      WHERE p.id = NULLIF(btrim(item_row.elem->>'product_id'), '')
      LIMIT 1
    ) AS product_id,
    (
      SELECT pv.id
      FROM public.product_variants pv
      WHERE pv.id = NULLIF(btrim(item_row.elem->>'variant_id'), '')
      LIMIT 1
    ) AS variant_id,
    COALESCE(item_row.elem->>'sku', '') AS sku,
    COALESCE(NULLIF(btrim(item_row.elem->>'name'), ''), 'Création Club Parfum') AS product_name,
    COALESCE(item_row.elem->>'variant', '') AS variant_label,
    CASE
      WHEN COALESCE(item_row.elem->>'price', '') ~ '^-?[0-9]+(\.[0-9]+)?$'
        THEN GREATEST(0, (item_row.elem->>'price')::NUMERIC(10,2))
      ELSE 0::NUMERIC(10,2)
    END AS unit_price,
    CASE
      WHEN COALESCE(item_row.elem->>'qty', '') ~ '^[0-9]+$'
           AND (item_row.elem->>'qty')::INTEGER > 0
        THEN (item_row.elem->>'qty')::INTEGER
      ELSE 1
    END AS quantity,
    ROUND(
      (
        CASE
          WHEN COALESCE(item_row.elem->>'price', '') ~ '^-?[0-9]+(\.[0-9]+)?$'
            THEN GREATEST(0, (item_row.elem->>'price')::NUMERIC(10,2))
          ELSE 0::NUMERIC(10,2)
        END
        *
        CASE
          WHEN COALESCE(item_row.elem->>'qty', '') ~ '^[0-9]+$'
               AND (item_row.elem->>'qty')::INTEGER > 0
            THEN (item_row.elem->>'qty')::INTEGER
          ELSE 1
        END
      )::NUMERIC,
      2
    ) AS total_price,
    COALESCE(o.created_at, NOW()) AS created_at
  FROM public.orders o
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE
      WHEN jsonb_typeof(o.items) = 'array' THEN o.items
      ELSE '[]'::jsonb
    END
  ) WITH ORDINALITY AS item_row(elem, ordinality)
  WHERE jsonb_typeof(o.items) = 'array'
    AND NOT EXISTS (
      SELECT 1
      FROM public.order_items existing
      WHERE existing.order_id = o.id
    )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ------------------------------------------------------------------------------
-- 5. GARANTIE DES FOREIGN KEYS PRINCIPALES (CRÉATION SI ABSENTES)
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_category_id_fkey'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id)
      REFERENCES public.categories(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_variants_product_id_fkey'
      AND conrelid = 'public.product_variants'::regclass
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_product_id_fkey
      FOREIGN KEY (product_id)
      REFERENCES public.products(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_shipping_method_id_fkey'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_shipping_method_id_fkey
      FOREIGN KEY (shipping_method_id)
      REFERENCES public.shipping_methods(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_user_id_fkey'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customer_profiles_id_fkey'
      AND conrelid = 'public.customer_profiles'::regclass
  ) THEN
    ALTER TABLE public.customer_profiles
      ADD CONSTRAINT customer_profiles_id_fkey
      FOREIGN KEY (id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 6. CONTRAINTES CHECK DE DOMAINE ET FINANCES (IDEMPOTENTES)
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_base_price_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_base_price_check
      CHECK (base_price >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_variants_price_check'
      AND conrelid = 'public.product_variants'::regclass
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_price_check
      CHECK (price >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shipping_methods_price_check'
      AND conrelid = 'public.shipping_methods'::regclass
  ) THEN
    ALTER TABLE public.shipping_methods
      ADD CONSTRAINT shipping_methods_price_check
      CHECK (price >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_amounts_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_amounts_check
      CHECK (subtotal >= 0 AND shipping_cost >= 0 AND total >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_status_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_payment_status_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired', 'refunded'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'withdrawal_requests_status_check'
      AND conrelid = 'public.withdrawal_requests'::regclass
  ) THEN
    ALTER TABLE public.withdrawal_requests
      ADD CONSTRAINT withdrawal_requests_status_check
      CHECK (status IN ('received', 'reviewing', 'approved', 'rejected', 'refunded'));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 7. INDEX DE PERFORMANCE SUR FOREIGN KEYS ET RECHERCHES FRÉQUENTES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_olfactory_family
  ON public.products(olfactory_family);

CREATE INDEX IF NOT EXISTS idx_products_is_active_featured
  ON public.products(is_active, featured);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON public.product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON public.orders(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_shipping_method_id
  ON public.orders(shipping_method_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email_lower
  ON public.orders(lower(customer_email));

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON public.orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_variant_id
  ON public.order_items(variant_id);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_order_id
  ON public.withdrawal_requests(order_id);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_order_number_lower
  ON public.withdrawal_requests(lower(order_number));
