import { Product, Category, ShippingMethod, FaqItem } from "@/types/store";

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Bougies Parfumées",
    slug: "bougies-parfumees",
    description: "Cire 100% végétale de soja et colza, mèches en coton naturel pur et fragrances d'exception de Grasse.",
  },
  {
    id: "cat-2",
    name: "Eaux de Parfum",
    slug: "eaux-de-parfum",
    description: "Créations de haute parfumerie élaborées avec 15% à 20% de concentré sur base d'alcool végétal noble.",
  },
  {
    id: "cat-3",
    name: "Diffuseurs & Brumes",
    slug: "diffuseurs-brumes",
    description: "Solutions végétales par capillarité et brumes textiles pour embaumer délicatement votre intérieur au quotidien.",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    category_id: "cat-1",
    category_name: "Bougies Parfumées",
    name: "Bougie Ambre Précieux & Vanille",
    slug: "bougie-ambre-precieux-vanille",
    description: "Une atmosphère douce, chaleureuse et enveloppante. Les notes résineuses et chaudes d'ambre s'accordent à la rondeur veloutée d'une gousse de vanille bourbon de Madagascar, relevées d'un souffle boisé de santal.",
    scent_notes: ["Ambre chaud", "Vanille Bourbon", "Bois de Santal"],
    olfactory_family: "Orientale",
    facets: "Ambré • Suave • Boisé",
    olfactory_pyramid: {
      top_notes: ["Bergamote d'Italie", "Accord Héliotrope solaire"],
      heart_notes: ["Ambre résineux chaud", "Gousse de Vanille Bourbon"],
      base_notes: ["Bois de Santal crémeux", "Cèdre blanc", "Muscs soyeux"],
    },
    concentration_info: "Cire 100% végétale de soja & colza sans paraffine • Mèche coton pur non traité • Parfum concentré de Grasse",
    base_price: 24.90,
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-1-1", sku: "BOU-AMB-180", size_label: "180 g (env. 45h de brûle)", price: 24.90, in_stock: true },
      { id: "var-1-2", sku: "BOU-AMB-300", size_label: "300 g (env. 75h de brûle)", price: 34.90, in_stock: true },
    ],
  },
  {
    id: "prod-2",
    category_id: "cat-1",
    category_name: "Bougies Parfumées",
    name: "Bougie Fleur d'Oranger & Néroli",
    slug: "bougie-fleur-doranger-neroli",
    description: "L'évocation lumineuse et ensoleillée d'une oliveraie en fleurs sous le ciel méditerranéen. Les accents zestés du petit grain bigaradier s'épanouissent aux côtés de la délicatesse miellée de la fleur d'oranger distillée à Grasse.",
    scent_notes: ["Fleur d'Oranger", "Néroli pur", "Petit Grain"],
    olfactory_family: "Fleurie",
    facets: "Solaire • Floral • Zesté",
    olfactory_pyramid: {
      top_notes: ["Petit grain bigaradier", "Zeste de Mandarine jaune"],
      heart_notes: ["Fleur d'Oranger distillée à Grasse", "Néroli pur"],
      base_notes: ["Miel d'oranger", "Musc poudré délicat"],
    },
    concentration_info: "Cire 100% végétale sans paraffine ni dérivés pétrochimiques • Mèche en fibre de coton tressé",
    base_price: 24.90,
    images: [
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-2-1", sku: "BOU-ORA-180", size_label: "180 g (env. 45h de brûle)", price: 24.90, in_stock: true },
      { id: "var-2-2", sku: "BOU-ORA-300", size_label: "300 g (env. 75h de brûle)", price: 34.90, in_stock: true },
    ],
  },
  {
    id: "prod-3",
    category_id: "cat-1",
    category_name: "Bougies Parfumées",
    name: "Bougie Cerise Tentation & Amande",
    slug: "bougie-cerise-tentation-amande",
    description: "Inspirée de la tradition gourmande des maîtres confiseurs et parfumeurs de Provence. Une alliance irrésistible de cerise burlat compotée, d'amande douce poudrée et d'un voile de fève tonka toastée.",
    scent_notes: ["Cerise Noire", "Amande Douce", "Fève Tonka"],
    olfactory_family: "Gourmande",
    facets: "Gourmand • Fruité • Amandé",
    olfactory_pyramid: {
      top_notes: ["Cerise noire juteuse", "Amande amère délicate"],
      heart_notes: ["Sirop de griotte", "Fleur de prunier printanière"],
      base_notes: ["Fève Tonka du Brésil", "Vanille crémeuse douce"],
    },
    concentration_info: "Cire 100% végétale de colza & soja européen • Mèche coton sans plomb ni chlore",
    base_price: 24.90,
    images: [
      "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: false,
    variants: [
      { id: "var-3-1", sku: "BOU-CER-180", size_label: "180 g (env. 45h de brûle)", price: 24.90, in_stock: true },
    ],
  },
  {
    id: "prod-4",
    category_id: "cat-2",
    category_name: "Eaux de Parfum",
    name: "Eau de Parfum Ambre Sensuel",
    slug: "eau-de-parfum-ambre-sensuel",
    description: "Une fragrance charnelle et magnétique bâtie autour d'un cœur ambré précieux. Les notes épicées de poivre rose en tête ouvrent la voie à un benjoin réconfortant et à une vanille de Madagascar d'une persistance souveraine.",
    scent_notes: ["Ambre Précieux", "Poivre Rose", "Benjoin", "Vanille Bourbon"],
    olfactory_family: "Orientale",
    facets: "Sensuel • Épicé • Envoûtant",
    olfactory_pyramid: {
      top_notes: ["Poivre rose piquant", "Bergamote de Calabre pétillante"],
      heart_notes: ["Ambre royal réchauffant", "Résine de Benjoin", "Cannelle douce"],
      base_notes: ["Vanille Bourbon de Madagascar", "Patchouli d'Indonésie", "Voile de Cuir blanc"],
    },
    concentration_info: "Eau de Parfum (18% de concentré pur de Grasse sur base d'alcool végétal naturel de betterave)",
    base_price: 9.90,
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-4-1", sku: "EDP-AMB-10", size_label: "Format Découverte 10 ml (Vaporisateur de sac)", price: 9.90, in_stock: true },
      { id: "var-4-2", sku: "EDP-AMB-50", size_label: "Flacon Vaporisateur 50 ml", price: 28.00, in_stock: true },
      { id: "var-4-3", sku: "EDP-AMB-100", size_label: "Flacon Vaporisateur 100 ml", price: 38.00, in_stock: true },
    ],
  },
  {
    id: "prod-5",
    category_id: "cat-2",
    category_name: "Eaux de Parfum",
    name: "Eau de Parfum Fleur de Coton",
    slug: "eau-de-parfum-fleur-de-coton",
    description: "Une sensation de fraîcheur pure, aérienne et poudrée évoquant le linge blanc séché au vent printanier du Sud. Un cocon intime et rassurant mariant l'iris délicat, le musc blanc caressant et la rose de mai.",
    scent_notes: ["Fleur de Coton", "Iris Poudré", "Musc Blanc"],
    olfactory_family: "Poudrée",
    facets: "Poudré • Musqué • Cocon",
    olfactory_pyramid: {
      top_notes: ["Fleur de coton blanche", "Accord linge frais au vent"],
      heart_notes: ["Iris de Florence poudré", "Rose de Mai de Grasse", "Jasmin d'eau"],
      base_notes: ["Muscs blancs soyeux", "Bois de santal doux", "Accord Héliotrope"],
    },
    concentration_info: "Eau de Parfum (15% de concentré de Grasse sur base d'alcool végétal)",
    base_price: 9.90,
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-5-1", sku: "EDP-COT-10", size_label: "Format Découverte 10 ml (Vaporisateur de sac)", price: 9.90, in_stock: true },
      { id: "var-5-2", sku: "EDP-COT-50", size_label: "Flacon Vaporisateur 50 ml", price: 28.00, in_stock: true },
      { id: "var-5-3", sku: "EDP-COT-100", size_label: "Flacon Vaporisateur 100 ml", price: 38.00, in_stock: true },
    ],
  },
  {
    id: "prod-6",
    category_id: "cat-2",
    category_name: "Eaux de Parfum",
    name: "Eau de Parfum Vanille Suprême (Collection Privée)",
    slug: "eau-de-parfum-vanille-supreme-collection-privee",
    description: "Une création d'exception issue de notre Collection Privée. Loin des vanilles sucrées synthétiques, cette formule met en scène une vanille noire complexe, liquoreuse et fumée, magnifiée par un accord de rhum ambré et de fève tonka.",
    scent_notes: ["Caviar de Vanille", "Rhum Ambré", "Fève Tonka", "Cèdre Fumé"],
    olfactory_family: "Gourmande",
    facets: "Riche • Boisé • Balsamique",
    olfactory_pyramid: {
      top_notes: ["Orchidée blanche vanillée", "Fleur de tiaré subtile"],
      heart_notes: ["Caviar de vanille bourbon", "Rhum ambré vieilli", "Fève tonka torréfiée"],
      base_notes: ["Bois de cèdre fumé", "Ambre doré profond", "Caramel au beurre d'antan"],
    },
    concentration_info: "Eau de Parfum Haute Concentration (20% de concentré rare de Grasse sur base d'alcool végétal)",
    base_price: 12.00,
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: false,
    variants: [
      { id: "var-6-1", sku: "EDP-VAN-10", size_label: "Format Découverte 10 ml (Vapo Luxe)", price: 12.00, in_stock: true },
      { id: "var-6-2", sku: "EDP-VAN-50", size_label: "Flacon Prestige 50 ml", price: 34.00, in_stock: true },
      { id: "var-6-3", sku: "EDP-VAN-100", size_label: "Flacon Prestige 100 ml", price: 46.00, in_stock: true },
    ],
  },
  {
    id: "prod-7",
    category_id: "cat-3",
    category_name: "Diffuseurs & Brumes",
    name: "Brume d'Oreiller Rose Cachemire",
    slug: "brume-d-oreiller-rose-cachemire",
    description: "Une brume de linge apaisante conçue pour instaurer un rituel de sommeil calme et velouté. Formulée sans alcool agressif, elle diffuse sur vos draps et coussins une eau florale de rose de Grasse et des muscs cotonneux relaxants.",
    scent_notes: ["Rose de Grasse", "Pivoine Rosée", "Musc Coton"],
    olfactory_family: "Fleurie",
    facets: "Apaisant • Floral • Velouté",
    olfactory_pyramid: {
      top_notes: ["Eau florale de rose distillée", "Pivoine printanière fraîche"],
      heart_notes: ["Pétales de rose damascena", "Lait d'amande douce"],
      base_notes: ["Cachemire poudré", "Musc blanc délassant"],
    },
    concentration_info: "Brume textile et d'oreiller sans alcool dénaturant agressif, formulée pour un respect absolu du linge délicat",
    base_price: 18.90,
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: false,
    variants: [
      { id: "var-7-1", sku: "BRU-ROS-100", size_label: "Flacon Brume 100 ml", price: 18.90, in_stock: true },
    ],
  },
  {
    id: "prod-8",
    category_id: "cat-3",
    category_name: "Diffuseurs & Brumes",
    name: "Diffuseur à Tiges Cèdre de l'Atlas & Sauge",
    slug: "diffuseur-cedre-atlas-sauge",
    description: "Diffusion continue et naturelle par capillarité. Une fragrance boisée et aromatique vivifiante associant le cèdre noble des hauteurs de l'Atlas, la sauge sclarée provençale et la verdeur épicée de la cardamome.",
    scent_notes: ["Cèdre de l'Atlas", "Sauge Sclarée", "Cardamome", "Vétiver"],
    olfactory_family: "Boisée",
    facets: "Boisé • Aromatique • Revitalisant",
    olfactory_pyramid: {
      top_notes: ["Sauge sclarée de Provence", "Cardamome verte craquante"],
      heart_notes: ["Cèdre de l'Atlas majestueux", "Aiguilles de pin sylvestre"],
      base_notes: ["Vétiver fumé", "Résine d'encens minérale", "Mousse de chêne"],
    },
    concentration_info: "Solution parfumée à base végétale sans phtalates ni glycol toxique • Tiges en rotin naturel pour 8 à 12 semaines de diffusion",
    base_price: 28.50,
    images: [
      "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-8-1", sku: "DIF-CED-100", size_label: "Flacon 100 ml + 8 bâtonnets en rotin", price: 28.50, in_stock: true },
      { id: "var-8-2", sku: "DIF-CED-REC200", size_label: "Recharge Éco 200 ml", price: 22.00, in_stock: true },
    ],
  },
];

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "ship-relay",
    code: "relay",
    name: "Point Relais (Mondial Relay)",
    carrier: "Mondial Relay",
    price: 4.50,
    estimated_days: "3 à 5 jours ouvrés",
    requires_relay_point: true,
    description: "Retrait pratique dans le commerce de proximité ou locker de votre choix. Offert dès 60 €.",
  },
  {
    id: "ship-colissimo",
    code: "colissimo",
    name: "Colissimo Domicile (Sans signature)",
    carrier: "La Poste Colissimo",
    price: 6.90,
    estimated_days: "48h à 72h ouvrées",
    requires_relay_point: false,
    description: "Livraison directement dans votre boîte aux lettres avec numéro de suivi. Offert dès 60 €.",
  },
  {
    id: "ship-express",
    code: "express",
    name: "Livraison Express 24h (Chronopost)",
    carrier: "Chronopost",
    price: 11.90,
    estimated_days: "24h ouvrées (si commande avant 13h)",
    requires_relay_point: false,
    description: "Remise en mains propres contre signature avec créneau horaire précis.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Comment choisir la senteur idéale à distance sans pouvoir la sentir ?",
    answer: "Chaque fiche de notre Maison détaille fidèlement la Pyramide Olfactive en 3 temps (Notes de Tête, Cœur et Fond) ainsi que la Famille Olfactive (Fleurie, Boisée, Gourmande, Orientale ou Poudrée). Si vous hésitez, commencez par notre format découverte de 10 ml en Eau de Parfum à 9,90 € pour tester l'alchimie sur votre peau, ou écrivez-nous directement sur WhatsApp pour un conseil sur-mesure selon vos préférences habituelles.",
    category: "Conseil",
  },
  {
    id: "faq-2",
    question: "Quelle est la différence entre une Eau de Toilette et nos Eaux de Parfum ?",
    answer: "Une Eau de Toilette ne contient généralement que 5% à 10% d'essences et s'évapore rapidement. Nos créations sont exclusivement des Eaux de Parfum de haute concentration (13% à 20% d'extraits purs de Grasse) formulées sur une base d'alcool végétal noble sans additifs nocifs. Cette concentration assure un sillage élégant et une tenue irréprochable tout au long de la journée.",
    category: "Savoir-Faire",
  },
  {
    id: "faq-3",
    question: "Pourquoi privilégier une bougie 100% cire végétale de soja et colza ?",
    answer: "La grande majorité des bougies industrielles est confectionnée à base de paraffine, un dérivé de pétrole qui libère des suies et des composés volatils lors de la combustion. Nos bougies utilisent exclusivement des cires 100% végétales de soja et colza européen sans OGM, associées à des mèches de coton pur non blanchies au chlore. Elles offrent une combustion lente, homogène et parfaitement propre pour l'air de votre foyer.",
    category: "Engagements",
  },
  {
    id: "faq-4",
    question: "Quels sont les délais et tarifs de livraison en France ?",
    answer: "Nous expédions vos colis sous 24h à 48h ouvrées. La livraison en Point Relais (Mondial Relay) est à 4,50 €, Colissimo Domicile sous 48h à 6,90 €, et Chronopost Express à 11,90 €. La livraison standard (Point Relais et Colissimo) vous est entièrement offerte dès 60 € d'achats sur l'ensemble de la boutique.",
    category: "Livraison",
  },
  {
    id: "faq-5",
    question: "Puis-je retourner un produit si je change d'avis ?",
    answer: "Conformément à la réglementation française et à l'article L.221-28 du Code de la consommation, vous bénéficiez d'un délai de 14 jours francs pour exercer votre droit de rétractation à compter de la réception de votre commande. Pour des raisons évidentes d'hygiène et de sécurité sanitaire, les parfums, bougies et cosmétiques doivent être retournés dans leur emballage d'origine scellé, non ouverts et en parfait état de revente.",
    category: "Retours",
  },
];

export interface CategoryPageConfig {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  group: "parfums" | "maison";
  badge?: string;
  filterType: "category" | "family" | "discovery" | "search" | "collection-privee";
  filterValue?: string | string[];
}

export const CATEGORY_PAGES: Record<string, CategoryPageConfig> = {
  "eaux-de-parfum": {
    slug: "eaux-de-parfum",
    title: "Eaux de Parfum de Grasse",
    subtitle: "Haute Concentration 15% à 20% • Alcool Végétal",
    description:
      "Nos Eaux de Parfum sont formulées à Grasse avec 15% à 20% d'extraits purs macérés dans un alcool végétal noble, pour un sillage intime et persistant.",
    heroImage:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200",
    group: "parfums",
    badge: "Haute Parfumerie",
    filterType: "category",
    filterValue: "cat-2",
  },
  "famille-orientale": {
    slug: "famille-orientale",
    title: "Famille Orientale, Ambrée & Gourmande",
    subtitle: "Sillages Chaleureux & Envoûtants",
    description:
      "Des accords riches d'ambre précieux, de vanille bourbon de Madagascar, de fève tonka et d'épices douces pour une signature magnétique.",
    heroImage:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200",
    group: "parfums",
    badge: "Accords Chaleureux",
    filterType: "family",
    filterValue: ["Orientale", "Gourmande"],
  },
  "famille-poudree": {
    slug: "famille-poudree",
    title: "Famille Fleurie, Poudrée & Coton",
    subtitle: "Fraîcheur Pure & Cocon Apaisant",
    description:
      "L'élégance aérienne de la fleur de coton, de l'iris poudré, de la fleur d'oranger et de la rose de Grasse.",
    heroImage:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1200",
    group: "parfums",
    badge: "Accords Délicats",
    filterType: "family",
    filterValue: ["Poudrée", "Fleurie"],
  },
  "collection-privee": {
    slug: "collection-privee",
    title: "Collection Privée & Prestige",
    subtitle: "Créations Rares • Concentration 20%",
    description:
      "Nos formules les plus intenses et exclusives, travaillées autour de matières premières d'exception comme le caviar de vanille bourbon et l'ambre royal.",
    heroImage:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200",
    group: "parfums",
    badge: "Édition Prestige",
    filterType: "collection-privee",
    filterValue: "cat-2",
  },
  "format-decouverte": {
    slug: "format-decouverte",
    title: "Formats Découverte 10 ml",
    subtitle: "Essayez votre parfum sur peau sans risque dès 9,90 €",
    description:
      "Le vaporisateur nomade de 10 ml vous permet de tester l'évolution de nos Eaux de Parfum sur votre peau pendant plusieurs jours avant d'adopter le grand flacon.",
    heroImage:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200",
    group: "parfums",
    badge: "Essai Sans Risque",
    filterType: "discovery",
  },
  "maison": {
    slug: "maison",
    title: "L'Âme de votre Maison",
    subtitle: "Bougies Végétales, Brumes d'Oreiller & Diffuseurs",
    description:
      "Enveloppez chaque pièce d'une aura chaleureuse et saine grâce à nos cires 100% végétales et nos diffuseurs par capillarité.",
    heroImage:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1200",
    group: "maison",
    badge: "Parfums d'Intérieur",
    filterType: "category",
    filterValue: ["cat-1", "cat-3"],
  },
  "bougies-parfumees": {
    slug: "bougies-parfumees",
    title: "Bougies Parfumées 100% Végétales",
    subtitle: "Cire de Soja & Colza • Sans Paraffine • Mèche Coton",
    description:
      "Coulées à la main avec des essences de Grasse, nos bougies végétales offrent une flamme propre et plus de 45 heures de diffusion enveloppante.",
    heroImage:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1200",
    group: "maison",
    badge: "Cires Pures",
    filterType: "category",
    filterValue: "cat-1",
  },
  "brumes-oreiller": {
    slug: "brumes-oreiller",
    title: "Brumes d'Oreiller & Linge",
    subtitle: "Rituel du Soir & Douceur Textile",
    description:
      "Formulées sans alcool agressif pour parfumer délicatement vos draps, oreillers et rideaux d'un voile apaisant.",
    heroImage:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1200",
    group: "maison",
    badge: "Rituel Sommeil",
    filterType: "search",
    filterValue: "brume",
  },
  "diffuseurs-ambiance": {
    slug: "diffuseurs-ambiance",
    title: "Diffuseurs à Tiges & Parfums d'Intérieur",
    subtitle: "Diffusion Continue par Capillarité • 8 à 12 Semaines",
    description:
      "Nos diffuseurs à bâtonnets en rotin naturel embaument votre intérieur en continu avec élégance et sobriété.",
    heroImage:
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1200",
    group: "maison",
    badge: "Diffusion Continue",
    filterType: "search",
    filterValue: "diffuseur",
  },
};

