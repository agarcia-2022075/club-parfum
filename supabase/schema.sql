-- ==============================================================================
-- CLUB PARFUM (MAISON DE SENTEURS • FRANCE)
-- SCHÉMA DE BASE DE DONNÉES SUPABASE (POSTGRESQL) + DONNÉES INITIALES
-- ==============================================================================

-- 1. EXTENSIONS NÉCESSAIRES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUPPRESSION PRÉVENTIVE (Optionnelle, pour réinitialisation propre)
DROP TABLE IF EXISTS customer_profiles CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS olfactory_families CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS shipping_methods CASCADE;

-- 3. TABLE CATÉGORIES
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.1 TABLE FAMILLES OLFACTIVES
CREATE TABLE IF NOT EXISTS olfactory_families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  mood TEXT NOT NULL DEFAULT 'Accord Signature de Grasse',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE PRODUITS (Avec Famille Olfactive, Facettes & Pyramide en 3 niveaux)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  scent_notes TEXT[] NOT NULL DEFAULT '{}',
  olfactory_family TEXT NOT NULL,
  facets TEXT NOT NULL,
  olfactory_pyramid JSONB NOT NULL DEFAULT '{"top_notes":[],"heart_notes":[],"base_notes":[]}'::jsonb,
  concentration_info TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE VARIANTES DE PRODUITS (Formats & Contenances)
CREATE TABLE product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  size_label TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE MODES DE LIVRAISON (France Métropolitaine)
CREATE TABLE shipping_methods (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  carrier TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  estimated_days TEXT NOT NULL,
  requires_relay_point BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE COMMANDES (Format conforme logistique & droit français)
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_method_id TEXT REFERENCES shipping_methods(id),
  shipping_method TEXT NOT NULL,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  relay_point TEXT,
  address TEXT,
  building TEXT,
  digicode TEXT,
  postal_code TEXT,
  city TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | shipped | delivered | cancelled
  tracking TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.1 TABLE PROFILS CLIENTS (Carnet d'adresses & Préférences Olfactives liés à Supabase Auth)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  building TEXT DEFAULT '',
  digicode TEXT DEFAULT '',
  postal_code TEXT DEFAULT '',
  city TEXT DEFAULT '',
  favorite_family TEXT DEFAULT 'Orientale',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. POLITIQUES DE SÉCURITÉ (ROW LEVEL SECURITY - RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE olfactory_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- 8.1 Lecture publique du catalogue (visiteurs et clients de la boutique)
CREATE POLICY "Lecture publique des catégories" ON categories FOR SELECT USING (true);
CREATE POLICY "Lecture publique des familles olfactives" ON olfactory_families FOR SELECT USING (true);
CREATE POLICY "Lecture publique des produits" ON products FOR SELECT USING (true);
CREATE POLICY "Lecture publique des variantes" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Lecture publique des modes de livraison" ON shipping_methods FOR SELECT USING (true);

-- 8.2 Politiques RLS strictes pour les Profils Clients (Seul le titulaire authentifié peut lire ou modifier son profil)
DROP POLICY IF EXISTS "Lecture profil personnel" ON customer_profiles;
CREATE POLICY "Lecture profil personnel" ON customer_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Insertion profil personnel" ON customer_profiles;
CREATE POLICY "Insertion profil personnel" ON customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Mise à jour profil personnel" ON customer_profiles;
CREATE POLICY "Mise à jour profil personnel" ON customer_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 8.3 Checkout Public: Le visiteur peut UNIQUEMENT insérer des commandes valides (INSERT)
-- SELECT bloqué pour les utilisateurs anonymes (prévention de fuite de données RGPD)
DROP POLICY IF EXISTS "Gestion admin des commandes" ON orders;
DROP POLICY IF EXISTS "Gestion admin des produits" ON products;
DROP POLICY IF EXISTS "Gestion admin des catégories" ON categories;
DROP POLICY IF EXISTS "Gestion admin des variantes" ON product_variants;
DROP POLICY IF EXISTS "Gestion admin des familles olfactives" ON olfactory_families;
DROP POLICY IF EXISTS "Création de commande publique" ON orders;
DROP POLICY IF EXISTS "Création de commande publique validée" ON orders;

CREATE POLICY "Insertion commande client anonyme" ON orders
  FOR INSERT WITH CHECK (
    length(order_number) > 0 AND
    length(customer_name) > 0 AND
    length(customer_email) > 0 AND
    total >= 0
  );

-- 8.4 Consultation de commande propre: Si authentifié, le client ne voit que ses propres commandes
CREATE POLICY "Lecture commandes propres client" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Note de sécurité Architecture:
-- Le catalogue est en lecture publique (SELECT) pour tous.
-- Les opérations administratives d'écriture (INSERT / UPDATE / DELETE) sur les commandes et le catalogue
-- sont réservées exclusivement au rôle service_role via getSupabaseAdmin() dans les API Routes protégées.

-- ==============================================================================
-- 9. INSERTION DES DONNÉES INITIALES (SEED DE DÉMO ARTISANALE DE GRASSE)
-- ==============================================================================

-- Catégories
INSERT INTO categories (id, name, slug, description) VALUES
('cat-1', 'Bougies Parfumées', 'bougies-parfumees', 'Cire 100% végétale de soja et colza, mèches en coton naturel pur et fragrances d''exception de Grasse.'),
('cat-2', 'Eaux de Parfum', 'eaux-de-parfum', 'Créations de haute parfumerie élaborées avec 15% à 20% de concentré sur base d''alcool végétal noble.'),
('cat-3', 'Diffuseurs & Brumes', 'diffuseurs-brumes', 'Solutions végétales par capillarité et brumes textiles pour embaumer délicatement votre intérieur au quotidien.')
ON CONFLICT (id) DO NOTHING;

-- Familles Olfactives
INSERT INTO olfactory_families (id, name, mood, description) VALUES
('fam-orientale', 'Orientale', 'Chaleureux & Envoûtant', 'Ambre doré, oud précieux, résines et épices douces.'),
('fam-boisee', 'Boisée', 'Noble & Apaisant', 'Cèdre de l''Atlas, santal, vétiver et sauge sclarée.'),
('fam-fleurie', 'Fleurie', 'Solaire & Lumineux', 'Fleur d''oranger de Grasse, rose centifolia, jasmin et néroli.'),
('fam-gourmande', 'Gourmande', 'Suave & Réconfortant', 'Vanille bourbon de Madagascar, fève tonka et notes miellées.'),
('fam-poudree', 'Poudrée', 'Doux & Cotonneux', 'Fleur de coton, iris pâle, musc blanc et héliotrope.'),
('fam-hesperidee', 'Hespéridée', 'Frais & Vivifiant', 'Bergamote de Calabre, mandarine, cédrat et petit-grain.'),
('fam-aromatique', 'Aromatique', 'Herbacé & Purifiant', 'Lavande fine de Provence, romarin, thym et eucalyptus.')
ON CONFLICT (id) DO NOTHING;

-- Modes de livraison France
INSERT INTO shipping_methods (id, code, name, carrier, price, estimated_days, requires_relay_point, description) VALUES
('ship-relay', 'relay', 'Point Relais (Mondial Relay)', 'Mondial Relay', 4.50, '3 à 5 jours ouvrés', true, 'Retrait pratique dans le commerce de proximité ou locker de votre choix. Offert dès 60 €.'),
('ship-colissimo', 'colissimo', 'Colissimo Domicile (Sans signature)', 'La Poste Colissimo', 6.90, '48h à 72h ouvrées', false, 'Livraison directement dans votre boîte aux lettres avec numéro de suivi. Offert dès 60 €.'),
('ship-express', 'express', 'Livraison Express 24h (Chronopost)', 'Chronopost', 11.90, '24h ouvrées (si commande avant 13h)', false, 'Remise en mains propres contre signature avec créneau horaire précis.');

-- Produits (8 créations complètes de Grasse)
INSERT INTO products (
  id, category_id, category_name, name, slug, description, scent_notes,
  olfactory_family, facets, olfactory_pyramid, concentration_info, base_price, images, is_active, featured
) VALUES
(
  'prod-1', 'cat-1', 'Bougies Parfumées', 'Bougie Ambre Précieux & Vanille', 'bougie-ambre-precieux-vanille',
  'Une atmosphère douce, chaleureuse et enveloppante. Les notes résineuses et chaudes d''ambre s''accordent à la rondeur veloutée d''une gousse de vanille bourbon de Madagascar, relevées d''un souffle boisé de santal.',
  ARRAY['Ambre chaud', 'Vanille Bourbon', 'Bois de Santal'],
  'Orientale', 'Ambré • Suave • Boisé',
  '{"top_notes":["Bergamote d''Italie","Accord Héliotrope solaire"],"heart_notes":["Ambre résineux chaud","Gousse de Vanille Bourbon"],"base_notes":["Bois de Santal crémeux","Cèdre blanc","Muscs soyeux"]}'::jsonb,
  'Cire 100% végétale de soja & colza sans paraffine • Mèche coton pur non traité • Parfum concentré de Grasse',
  24.90,
  ARRAY['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800'],
  true, true
),
(
  'prod-2', 'cat-1', 'Bougies Parfumées', 'Bougie Fleur d''Oranger & Néroli', 'bougie-fleur-doranger-neroli',
  'L''évocation lumineuse et ensoleillée d''une oliveraie en fleurs sous le ciel méditerranéen. Les accents zestés du petit grain bigaradier s''épanouissent aux côtés de la délicatesse miellée de la fleur d''oranger distillée à Grasse.',
  ARRAY['Fleur d''Oranger', 'Néroli pur', 'Petit Grain'],
  'Fleurie', 'Solaire • Floral • Zesté',
  '{"top_notes":["Petit grain bigaradier","Zeste de Mandarine jaune"],"heart_notes":["Fleur d''Oranger distillée à Grasse","Néroli pur"],"base_notes":["Miel d''oranger","Musc poudré délicat"]}'::jsonb,
  'Cire 100% végétale sans paraffine ni dérivés pétrochimiques • Mèche en fibre de coton tressé',
  24.90,
  ARRAY['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800'],
  true, true
),
(
  'prod-3', 'cat-1', 'Bougies Parfumées', 'Bougie Cerise Tentation & Amande', 'bougie-cerise-tentation-amande',
  'Inspirée de la tradition gourmande des maîtres confiseurs et parfumeurs de Provence. Une alliance irrésistible de cerise burlat compotée, d''amande douce poudrée et d''un voile de fève tonka toastée.',
  ARRAY['Cerise Noire', 'Amande Douce', 'Fève Tonka'],
  'Gourmande', 'Gourmand • Fruité • Amandé',
  '{"top_notes":["Cerise noire juteuse","Amande amère délicate"],"heart_notes":["Sirop de griotte","Fleur de prunier printanière"],"base_notes":["Fève Tonka du Brésil","Vanille crémeuse douce"]}'::jsonb,
  'Cire 100% végétale de colza & soja européen • Mèche coton sans plomb ni chlore',
  24.90,
  ARRAY['https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&q=80&w=800'],
  true, false
),
(
  'prod-4', 'cat-2', 'Eaux de Parfum', 'Eau de Parfum Ambre Sensuel', 'eau-de-parfum-ambre-sensuel',
  'Une fragrance charnelle et magnétique bâtie autour d''un cœur ambré précieux. Les notes épicées de poivre rose en tête ouvrent la voie à un benjoin réconfortant et à une vanille de Madagascar d''une persistance souveraine.',
  ARRAY['Ambre Précieux', 'Poivre Rose', 'Benjoin', 'Vanille Bourbon'],
  'Orientale', 'Sensuel • Épicé • Envoûtant',
  '{"top_notes":["Poivre rose piquant","Bergamote de Calabre pétillante"],"heart_notes":["Ambre royal réchauffant","Résine de Benjoin","Cannelle douce"],"base_notes":["Vanille Bourbon de Madagascar","Patchouli d''Indonésie","Voile de Cuir blanc"]}'::jsonb,
  'Eau de Parfum (18% de concentré pur de Grasse sur base d''alcool végétal naturel de betterave)',
  9.90,
  ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800'],
  true, true
),
(
  'prod-5', 'cat-2', 'Eaux de Parfum', 'Eau de Parfum Fleur de Coton', 'eau-de-parfum-fleur-de-coton',
  'Une sensation de fraîcheur pure, aérienne et poudrée évoquant le linge blanc séché au vent printanier du Sud. Un cocon intime et rassurant mariant l''iris délicat, le musc blanc caressant et la rose de mai.',
  ARRAY['Fleur de Coton', 'Iris Poudré', 'Musc Blanc'],
  'Poudrée', 'Poudré • Musqué • Cocon',
  '{"top_notes":["Fleur de coton blanche","Accord linge frais au vent"],"heart_notes":["Iris de Florence poudré","Rose de Mai de Grasse","Jasmin d''eau"],"base_notes":["Muscs blancs soyeux","Bois de santal doux","Accord Héliotrope"]}'::jsonb,
  'Eau de Parfum (15% de concentré de Grasse sur base d''alcool végétal)',
  9.90,
  ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'],
  true, true
),
(
  'prod-6', 'cat-2', 'Eaux de Parfum', 'Eau de Parfum Vanille Suprême (Collection Privée)', 'eau-de-parfum-vanille-supreme-collection-privee',
  'Une création d''exception issue de notre Collection Privée. Loin des vanilles sucrées synthétiques, cette formule met en scène une vanille noire complexe, liquoreuse et fumée, magnifiée par un accord de rhum ambré et de fève tonka.',
  ARRAY['Caviar de Vanille', 'Rhum Ambré', 'Fève Tonka', 'Cèdre Fumé'],
  'Gourmande', 'Riche • Boisé • Balsamique',
  '{"top_notes":["Orchidée blanche vanillée","Fleur de tiaré subtile"],"heart_notes":["Caviar de vanille bourbon","Rhum ambré vieilli","Fève tonka torréfiée"],"base_notes":["Bois de cèdre fumé","Ambre doré profond","Caramel au beurre d''antan"]}'::jsonb,
  'Eau de Parfum Haute Concentration (20% de concentré rare de Grasse sur base d''alcool végétal)',
  12.00,
  ARRAY['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800'],
  true, false
),
(
  'prod-7', 'cat-3', 'Diffuseurs & Brumes', 'Brume d''Oreiller Rose Cachemire', 'brume-d-oreiller-rose-cachemire',
  'Une brume de linge apaisante conçue pour instaurer un rituel de sommeil calme et velouté. Formulée sans alcool agressif, elle diffuse sur vos draps et coussins une eau florale de rose de Grasse et des muscs cotonneux relaxants.',
  ARRAY['Rose de Grasse', 'Pivoine Rosée', 'Musc Coton'],
  'Fleurie', 'Apaisant • Floral • Velouté',
  '{"top_notes":["Eau florale de rose distillée","Pivoine printanière fraîche"],"heart_notes":["Pétales de rose damascena","Lait d''amande douce"],"base_notes":["Cachemire poudré","Musc blanc délassant"]}'::jsonb,
  'Brume textile et d''oreiller sans alcool dénaturant agressif, formulée pour un respect absolu du linge délicat',
  18.90,
  ARRAY['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800'],
  true, false
),
(
  'prod-8', 'cat-3', 'Diffuseurs & Brumes', 'Diffuseur à Tiges Cèdre de l''Atlas & Sauge', 'diffuseur-cedre-atlas-sauge',
  'Diffusion continue et naturelle par capillarité. Une fragrance boisée et aromatique vivifiante associant le cèdre noble des hauteurs de l''Atlas, la sauge sclarée provençale et la verdeur épicée de la cardamome.',
  ARRAY['Cèdre de l''Atlas', 'Sauge Sclarée', 'Cardamome', 'Vétiver'],
  'Boisée', 'Boisé • Aromatique • Revitalisant',
  '{"top_notes":["Sauge sclarée de Provence","Cardamome verte craquante"],"heart_notes":["Cèdre de l''Atlas majestueux","Aiguilles de pin sylvestre"],"base_notes":["Vétiver fumé","Résine d''encens minérale","Mousse de chêne"]}'::jsonb,
  'Solution parfumée à base végétale sans phtalates ni glycol toxique • Tiges en rotin naturel pour 8 à 12 semaines de diffusion',
  28.50,
  ARRAY['https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800'],
  true, true
);

-- Variantes de formats
INSERT INTO product_variants (id, product_id, sku, size_label, price, in_stock) VALUES
('var-1-1', 'prod-1', 'BOU-AMB-180', '180 g (env. 45h de brûle)', 24.90, true),
('var-1-2', 'prod-1', 'BOU-AMB-300', '300 g (env. 75h de brûle)', 34.90, true),
('var-2-1', 'prod-2', 'BOU-ORA-180', '180 g (env. 45h de brûle)', 24.90, true),
('var-2-2', 'prod-2', 'BOU-ORA-300', '300 g (env. 75h de brûle)', 34.90, true),
('var-3-1', 'prod-3', 'BOU-CER-180', '180 g (env. 45h de brûle)', 24.90, true),
('var-4-1', 'prod-4', 'EDP-AMB-10', 'Format Découverte 10 ml (Vaporisateur de sac)', 9.90, true),
('var-4-2', 'prod-4', 'EDP-AMB-50', 'Flacon Vaporisateur 50 ml', 28.00, true),
('var-4-3', 'prod-4', 'EDP-AMB-100', 'Flacon Vaporisateur 100 ml', 38.00, true),
('var-5-1', 'prod-5', 'EDP-COT-10', 'Format Découverte 10 ml (Vaporisateur de sac)', 9.90, true),
('var-5-2', 'prod-5', 'EDP-COT-50', 'Flacon Vaporisateur 50 ml', 28.00, true),
('var-5-3', 'prod-5', 'EDP-COT-100', 'Flacon Vaporisateur 100 ml', 38.00, true),
('var-6-1', 'prod-6', 'EDP-VAN-10', 'Format Découverte 10 ml (Vapo Luxe)', 12.00, true),
('var-6-2', 'prod-6', 'EDP-VAN-50', 'Flacon Prestige 50 ml', 34.00, true),
('var-6-3', 'prod-6', 'EDP-VAN-100', 'Flacon Prestige 100 ml', 46.00, true),
('var-7-1', 'prod-7', 'BRU-ROS-100', 'Flacon Brume 100 ml', 18.90, true),
('var-8-1', 'prod-8', 'DIF-CED-100', 'Flacon 100 ml + 8 bâtonnets en rotin', 28.50, true),
('var-8-2', 'prod-8', 'DIF-CED-REC200', 'Recharge Éco 200 ml', 22.00, true);

-- ==============================================================================
-- 10. CONFIGURATION DU BUCKET SUPABASE STORAGE ('products')
-- ==============================================================================
-- Création du bucket public pour les photographies de flacons et bougies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Politiques RLS pour Storage
DROP POLICY IF EXISTS "Lecture publique des photos de produits" ON storage.objects;
CREATE POLICY "Lecture publique des photos de produits" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Téléversement admin des photos de produits" ON storage.objects;
CREATE POLICY "Téléversement admin des photos de produits" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');
