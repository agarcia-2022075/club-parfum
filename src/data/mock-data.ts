import { Product, Category, ShippingMethod } from "@/types/store";

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Bougies Parfumées",
    slug: "bougies-parfumees",
    description: "Cire 100% végétale, mèches en coton naturel et parfums de Grasse.",
  },
  {
    id: "cat-2",
    name: "Eaux de Parfum",
    slug: "eaux-de-parfum",
    description: "Créations olfactives intenses et délicates pour le quotidien.",
  },
  {
    id: "cat-3",
    name: "Diffuseurs & Brumes",
    slug: "diffuseurs-brumes",
    description: "Pour parfumer délicatement vos intérieurs en continu.",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    category_id: "cat-1",
    category_name: "Bougies Parfumées",
    name: "Bougie Ambre Précieux & Vanille",
    slug: "bougie-ambre-precieux-vanille",
    description: "Une atmosphère douce et enveloppante. Des notes chaudes d'ambre réhaussées par la douceur suave d'une gousse de vanille bourbon de Madagascar.",
    scent_notes: ["Ambre chaud", "Vanille Bourbon", "Bois de Santal"],
    base_price: 24.90,
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-1-1", sku: "BOU-AMB-180", size_label: "180 g (45h de brûle)", price: 24.90, in_stock: true },
      { id: "var-1-2", sku: "BOU-AMB-300", size_label: "300 g (75h de brûle)", price: 34.90, in_stock: true },
    ],
  },
  {
    id: "prod-2",
    category_id: "cat-2",
    category_name: "Eaux de Parfum",
    name: "Eau de Parfum Fleur de Coton",
    slug: "eau-de-parfum-fleur-de-coton",
    description: "Une sensation de fraîcheur pure et poudrée évoquant le linge propre et la brise printanière du sud de la France.",
    scent_notes: ["Fleur de Coton", "Musc Blanc", "Bergamote"],
    base_price: 38.00,
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-2-1", sku: "EDP-COT-50", size_label: "Flacon 50 ml", price: 38.00, in_stock: true },
      { id: "var-2-2", sku: "EDP-COT-100", size_label: "Flacon 100 ml", price: 54.00, in_stock: true },
    ],
  },
  {
    id: "prod-3",
    category_id: "cat-1",
    category_name: "Bougies Parfumées",
    name: "Bougie Fleur d'Oranger & Néroli",
    slug: "bougie-fleur-doranger-neroli",
    description: "Évocation solaire d'un jardin méditerranéen. Les accents zestés du petit grain se mêlent à la délicatesse miellée de la fleur d'oranger.",
    scent_notes: ["Fleur d'Oranger", "Néroli", "Petit Grain"],
    base_price: 24.90,
    images: [
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-3-1", sku: "BOU-ORA-180", size_label: "180 g (45h)", price: 24.90, in_stock: true },
    ],
  },
  {
    id: "prod-4",
    category_id: "cat-3",
    category_name: "Diffuseurs & Brumes",
    name: "Diffuseur à Tiges Cèdre & Sauge",
    slug: "diffuseur-cedre-sauge",
    description: "Diffusion continue par capillarité. Une fragrance boisée vivifiante qui apporte calme et sérénité dans votre salon ou bureau.",
    scent_notes: ["Cèdre de l'Atlas", "Sauge Blanche", "Cardamome"],
    base_price: 28.50,
    images: [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=800",
    ],
    is_active: true,
    featured: true,
    variants: [
      { id: "var-4-1", sku: "DIF-CED-100", size_label: "100 ml + 8 bâtonnets", price: 28.50, in_stock: true },
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
    description: "Retrait dans le commerce ou locker le plus proche de chez vous.",
  },
  {
    id: "ship-colissimo",
    code: "colissimo",
    name: "Colissimo Domicile",
    carrier: "La Poste Colissimo",
    price: 6.90,
    estimated_days: "2 à 3 jours ouvrés",
    requires_relay_point: false,
    description: "Livraison directement dans votre boîte aux lettres.",
  },
  {
    id: "ship-express",
    code: "express",
    name: "Livraison Express & Remise contre signature",
    carrier: "Chronopost / Colissimo Expert",
    price: 11.90,
    estimated_days: "24h à 48h",
    requires_relay_point: false,
    description: "Remise en mains propres sécurisée avec suivi prioritaire.",
  },
];
