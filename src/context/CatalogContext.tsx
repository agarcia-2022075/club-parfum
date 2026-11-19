"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, Category, OlfactoryFamilyItem, OlfactoryPyramid, ProductVariant } from "@/types/store";
import { MOCK_PRODUCTS, CATEGORIES } from "@/data/mock-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const STORAGE_KEY_PRODUCTS = "club_parfum_catalog";
const STORAGE_KEY_CATEGORIES = "club_parfum_categories";
const STORAGE_KEY_FAMILIES = "club_parfum_families";

export const DEFAULT_OLFACTORY_FAMILIES: OlfactoryFamilyItem[] = [
  {
    id: "fam-orientale",
    name: "Orientale",
    mood: "Chaleureux & Envoûtant",
    description: "Ambre doré, oud précieux, résines et épices douces.",
  },
  {
    id: "fam-boisee",
    name: "Boisée",
    mood: "Noble & Apaisant",
    description: "Cèdre de l'Atlas, santal, vétiver et sauge sclarée.",
  },
  {
    id: "fam-fleurie",
    name: "Fleurie",
    mood: "Solaire & Lumineux",
    description: "Fleur d'oranger de Grasse, rose centifolia, jasmin et néroli.",
  },
  {
    id: "fam-gourmande",
    name: "Gourmande",
    mood: "Suave & Réconfortant",
    description: "Vanille bourbon de Madagascar, fève tonka et notes miellées.",
  },
  {
    id: "fam-poudree",
    name: "Poudrée",
    mood: "Doux & Cotonneux",
    description: "Fleur de coton, iris pâle, musc blanc et héliotrope.",
  },
  {
    id: "fam-hesperidee",
    name: "Hespéridée",
    mood: "Frais & Vivifiant",
    description: "Bergamote de Calabre, mandarine, cédrat et petit-grain.",
  },
  {
    id: "fam-aromatique",
    name: "Aromatique",
    mood: "Herbacé & Purifiant",
    description: "Lavande fine de Provence, romarin, thym et eucalyptus.",
  },
];

interface DbCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface DbFamilyRow {
  id: string;
  name: string;
  mood: string | null;
  description: string | null;
}

interface DbProductVariantRow {
  id: string;
  sku: string;
  size_label: string;
  price: number | string;
  in_stock: boolean;
  stock_quantity?: number | null;
}

interface DbProductRow {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  scent_notes: string[] | null;
  olfactory_family: string;
  facets: string;
  olfactory_pyramid: OlfactoryPyramid;
  concentration_info: string | null;
  base_price: number | string;
  images: string[] | null;
  is_active: boolean;
  featured: boolean | null;
  product_variants: DbProductVariantRow[] | null;
}

function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data && typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  } catch {
    // Ignorer erreur de parsing JSON
  }
  return fallback;
}

interface CatalogContextType {
  products: Product[];
  categories: Category[];
  olfactoryFamilies: OlfactoryFamilyItem[];

  // Produits & Formats (CRUD)
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleStock: (productId: string) => Promise<void>;
  toggleVariantStock: (productId: string, variantId: string) => Promise<void>;

  // Catégories (CRUD)
  addCategory: (cat: Omit<Category, "id">) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  // Familles Olfactives (CRUD)
  addOlfactoryFamily: (fam: Omit<OlfactoryFamilyItem, "id">) => Promise<void>;
  updateOlfactoryFamily: (fam: OlfactoryFamilyItem, oldName?: string) => Promise<void>;
  deleteOlfactoryFamily: (familyId: string) => Promise<void>;

  resetCatalog: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  isCustomized: boolean;
  isLiveDb: boolean;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [olfactoryFamilies, setOlfactoryFamilies] = useState<OlfactoryFamilyItem[]>(
    DEFAULT_OLFACTORY_FAMILIES
  );
  const [isCustomized, setIsCustomized] = useState<boolean>(false);
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);

  // 1. Chargement initial en lecture seule (SELECT public autorisé par RLS)
  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      // --- A. Chargement Catégories ---
      let loadedCategories: Category[] = CATEGORIES;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("created_at", { ascending: true });
          if (!error && data && data.length > 0) {
            loadedCategories = (data as DbCategoryRow[]).map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description || "",
            }));
          }
        } catch {
          // Utiliser repli
        }
      }
      if (loadedCategories === CATEGORIES) {
        try {
          const storedCats = localStorage.getItem(STORAGE_KEY_CATEGORIES);
          if (storedCats) {
            const parsed = JSON.parse(storedCats) as Category[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedCategories = parsed;
            }
          }
        } catch {
          // Ignorer
        }
      }
      if (isMounted) setCategories(loadedCategories);

      // --- B. Chargement Familles Olfactives ---
      let loadedFamilies: OlfactoryFamilyItem[] = DEFAULT_OLFACTORY_FAMILIES;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("olfactory_families")
            .select("*")
            .order("created_at", { ascending: true });
          if (!error && data && data.length > 0) {
            loadedFamilies = (data as DbFamilyRow[]).map((f) => ({
              id: f.id,
              name: f.name,
              mood: f.mood || "Accord Signature de Grasse",
              description: f.description || "",
            }));
          }
        } catch {
          // Table peut ne pas exister encore en Supabase
        }
      }
      if (loadedFamilies === DEFAULT_OLFACTORY_FAMILIES) {
        try {
          const storedFams = localStorage.getItem(STORAGE_KEY_FAMILIES);
          if (storedFams) {
            const parsed = JSON.parse(storedFams) as OlfactoryFamilyItem[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedFamilies = parsed;
            }
          }
        } catch {
          // Ignorer
        }
      }
      if (isMounted) setOlfactoryFamilies(loadedFamilies);

      // --- C. Chargement Produits & Variantes ---
      let loadedProducts: Product[] = MOCK_PRODUCTS;
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        try {
          const { data, error } = await client
            .from("products")
            .select("*, product_variants(*)")
            .order("created_at", { ascending: true });

          if (!error && data && data.length > 0 && isMounted) {
            const LEGACY_IMAGE_SNIPPETS = [
              "photo-1572635196237-14b3f281503f",
              "photo-1588776814546-1ffcf47267a5",
              "photo-1547887537-6158d64c35b3",
              "photo-1523293182086-7651a899d37f",
              "photo-1616949755610-8c9bbc08f138",
            ];

            loadedProducts = (data as DbProductRow[]).map((item) => {
              let images: string[] = item.images || [];
              const mockProd = MOCK_PRODUCTS.find((m) => m.id === item.id);
              const firstImg = images[0] || "";
              const hasLegacyImg =
                Boolean(mockProd) &&
                LEGACY_IMAGE_SNIPPETS.some((snippet) => firstImg.includes(snippet));

              if (mockProd && hasLegacyImg) {
                images = mockProd.images;
              }

              return {
                id: item.id,
                category_id: item.category_id,
                category_name: item.category_name,
                name: item.name,
                slug: item.slug,
                description: item.description,
                scent_notes: item.scent_notes || [],
                olfactory_family: item.olfactory_family,
                facets: item.facets,
                olfactory_pyramid: item.olfactory_pyramid,
                concentration_info: item.concentration_info || undefined,
                base_price: Number(item.base_price),
                images,
                is_active: item.is_active,
                featured: Boolean(item.featured),
                variants:
                  item.product_variants?.map((v): ProductVariant => {
                    const qty =
                      typeof v.stock_quantity === "number" && Number.isFinite(v.stock_quantity)
                        ? Math.max(0, Math.floor(v.stock_quantity))
                        : v.in_stock
                          ? 25
                          : 0;
                    return {
                      id: v.id,
                      sku: v.sku,
                      size_label: v.size_label,
                      price: Number(v.price),
                      in_stock: v.in_stock,
                      stock_quantity: qty,
                    };
                  }) || [],
              };
            });
            setProducts(loadedProducts);
            setIsLiveDb(true);
            return;
          }
        } catch (err) {
          console.warn("Échec du chargement Supabase, repli sur le cache local", err);
        }
      }

      // Repli localStorage en lecture seule si Supabase n'a rien retourné
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved) as Product[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            setIsCustomized(true);
          }
        }
      } catch (e) {
        console.warn("Impossible de charger le catalogue depuis localStorage", e);
      }
    }

    loadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- ACTIONS PRODUITS & VARIANTES (API ADMIN PROTÉGÉE) ---

  const addProduct = useCallback(async (newProduct: Product) => {
    let computedBasePrice = Number(newProduct.base_price);
    if (newProduct.variants && newProduct.variants.length > 0) {
      const positivePrices = newProduct.variants
        .map((v) => Number(v.price))
        .filter((p) => !isNaN(p) && p > 0);
      if (positivePrices.length > 0) {
        computedBasePrice = Math.min(...positivePrices);
      }
    }

    const productWithVariants: Product = {
      ...newProduct,
      base_price: computedBasePrice,
      variants:
        newProduct.variants && newProduct.variants.length > 0
          ? newProduct.variants
          : [
              {
                id: `var-${Date.now()}`,
                sku: `CP-${Date.now().toString().slice(-4)}`,
                size_label: newProduct.category_name?.toLowerCase().includes("bougie")
                  ? "180 g (env. 45h de brûle)"
                  : "Flacon Vaporisateur 50 ml",
                price: computedBasePrice,
                in_stock: true,
                stock_quantity: 25,
              },
            ],
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: productWithVariants }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible d'ajouter le produit."));
    }

    const data = (await res.json()) as { product?: Product };
    const savedProduct = data.product || productWithVariants;

    setProducts((prev) => [savedProduct, ...prev]);
    setIsCustomized(true);
    setIsLiveDb(true);
  }, []);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    let computedBasePrice = Number(updatedProduct.base_price);
    if (updatedProduct.variants && updatedProduct.variants.length > 0) {
      const positivePrices = updatedProduct.variants
        .map((v) => Number(v.price))
        .filter((p) => !isNaN(p) && p > 0);
      if (positivePrices.length > 0) {
        computedBasePrice = Math.min(...positivePrices);
      }
    }

    const finalizedProduct: Product = {
      ...updatedProduct,
      base_price: computedBasePrice,
    };

    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: finalizedProduct }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible de mettre à jour le produit."));
    }

    const data = (await res.json()) as { product?: Product };
    const savedProduct = data.product || finalizedProduct;

    setProducts((prev) => prev.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
    setIsCustomized(true);
    setIsLiveDb(true);
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible de supprimer ce produit."));
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setIsCustomized(true);
    setIsLiveDb(true);
  }, []);

  const toggleStock = useCallback(
    async (productId: string) => {
      const current = products.find((p) => p.id === productId);
      const newStatus = current ? !current.is_active : true;

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleStock",
          productId,
          is_active: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(
          await readApiError(res, "Impossible de modifier la disponibilité du produit.")
        );
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: newStatus } : p))
      );
      setIsCustomized(true);
      setIsLiveDb(true);
    },
    [products]
  );

  const toggleVariantStock = useCallback(
    async (productId: string, variantId: string) => {
      const currentProduct = products.find((p) => p.id === productId);
      const currentVariant = currentProduct?.variants?.find((v) => v.id === variantId);
      const targetNewStatus = currentVariant ? !currentVariant.in_stock : true;

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleVariantStock",
          productId,
          variantId,
          in_stock: targetNewStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Impossible de modifier le stock de ce format."));
      }

      const data = (await res.json()) as { in_stock?: boolean; stock_quantity?: number };
      const finalInStock = typeof data.in_stock === "boolean" ? data.in_stock : targetNewStatus;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId || !p.variants) return p;
          return {
            ...p,
            variants: p.variants.map((v) => {
              if (v.id !== variantId) return v;
              const nextQty =
                typeof data.stock_quantity === "number" && Number.isFinite(data.stock_quantity)
                  ? Math.max(0, Math.floor(data.stock_quantity))
                  : finalInStock
                    ? Math.max(1, v.stock_quantity || 25)
                    : 0;
              return { ...v, in_stock: finalInStock, stock_quantity: nextQty };
            }),
          };
        })
      );
      setIsCustomized(true);
      setIsLiveDb(true);
    },
    [products]
  );

  // --- ACTIONS CATÉGORIES (API ADMIN PROTÉGÉE) ---

  const addCategory = useCallback(async (cat: Omit<Category, "id">) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: cat.name.trim(),
      slug: cat.slug ? slugify(cat.slug) : slugify(cat.name),
      description: cat.description || "",
    };

    const res = await fetch("/api/admin/taxonomies", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", ...newCat }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible d'ajouter la catégorie."));
    }

    const data = (await res.json()) as { category?: Category };
    const savedCat = data.category || newCat;

    setCategories((prev) => [...prev, savedCat]);
    setIsLiveDb(true);
  }, []);

  const updateCategory = useCallback(async (cat: Category) => {
    const normalizedCat: Category = {
      ...cat,
      name: cat.name.trim(),
      slug: cat.slug ? slugify(cat.slug) : slugify(cat.name),
      description: cat.description || "",
    };

    const res = await fetch("/api/admin/taxonomies", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", ...normalizedCat }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible de modifier la catégorie."));
    }

    const data = (await res.json()) as { category?: Category };
    const savedCat = data.category || normalizedCat;

    setCategories((prev) => prev.map((c) => (c.id === savedCat.id ? savedCat : c)));
    setProducts((prev) =>
      prev.map((p) => (p.category_id === savedCat.id ? { ...p, category_name: savedCat.name } : p))
    );
    setIsLiveDb(true);
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    const res = await fetch("/api/admin/taxonomies", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", id: categoryId }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible de supprimer la catégorie."));
    }

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setIsLiveDb(true);
  }, []);

  // --- ACTIONS FAMILLES OLFACTIVES (API ADMIN PROTÉGÉE) ---

  const addOlfactoryFamily = useCallback(async (fam: Omit<OlfactoryFamilyItem, "id">) => {
    const newFam: OlfactoryFamilyItem = {
      id: `fam-${Date.now()}`,
      name: fam.name.trim(),
      mood: fam.mood.trim() || "Accord Signature de Grasse",
      description: fam.description || "",
    };

    const res = await fetch("/api/admin/taxonomies", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "family", ...newFam }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible d'ajouter la famille olfactive."));
    }

    const data = (await res.json()) as { family?: OlfactoryFamilyItem };
    const savedFam = data.family || newFam;

    setOlfactoryFamilies((prev) => [...prev, savedFam]);
    setIsLiveDb(true);
  }, []);

  const updateOlfactoryFamily = useCallback(
    async (fam: OlfactoryFamilyItem, oldName?: string) => {
      const normalizedFam: OlfactoryFamilyItem = {
        ...fam,
        name: fam.name.trim(),
        mood: fam.mood.trim() || "Accord Signature de Grasse",
        description: fam.description || "",
      };

      const res = await fetch("/api/admin/taxonomies", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "family",
          ...normalizedFam,
          oldName,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Impossible de modifier la famille olfactive."));
      }

      const data = (await res.json()) as { family?: OlfactoryFamilyItem };
      const savedFam = data.family || normalizedFam;

      setOlfactoryFamilies((prev) => prev.map((f) => (f.id === savedFam.id ? savedFam : f)));
      if (oldName && oldName !== savedFam.name) {
        setProducts((prev) =>
          prev.map((p) =>
            p.olfactory_family === oldName ? { ...p, olfactory_family: savedFam.name } : p
          )
        );
      }
      setIsLiveDb(true);
    },
    []
  );

  const deleteOlfactoryFamily = useCallback(async (familyId: string) => {
    const res = await fetch("/api/admin/taxonomies", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "family", id: familyId }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible de supprimer cette famille olfactive."));
    }

    setOlfactoryFamilies((prev) => prev.filter((f) => f.id !== familyId));
    setIsLiveDb(true);
  }, []);

  // --- RÉINITIALISATION DU CATALOGUE DÉMO ---

  const resetCatalog = useCallback(async () => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Impossible de réinitialiser le catalogue."));
    }

    try {
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.removeItem(STORAGE_KEY_FAMILIES);
    } catch {
      // Ignorer
    }

    setProducts(MOCK_PRODUCTS);
    setCategories(CATEGORIES);
    setOlfactoryFamilies(DEFAULT_OLFACTORY_FAMILIES);
    setIsCustomized(false);
    setIsLiveDb(true);
  }, []);

  const getProductBySlug = useCallback(
    (slug: string) => {
      return products.find((p) => p.slug === slug);
    },
    [products]
  );

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        olfactoryFamilies,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStock,
        toggleVariantStock,
        addCategory,
        updateCategory,
        deleteCategory,
        addOlfactoryFamily,
        updateOlfactoryFamily,
        deleteOlfactoryFamily,
        resetCatalog,
        getProductBySlug,
        isCustomized,
        isLiveDb,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog doit être utilisé à l'intérieur d'un CatalogProvider");
  }
  return context;
}
