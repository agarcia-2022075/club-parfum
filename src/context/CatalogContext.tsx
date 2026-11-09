"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, Category, OlfactoryFamilyItem } from "@/types/store";
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

  // 1. Chargement initial : Supabase prioritaire avec repli propre sur localStorage
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
            loadedCategories = data.map((c: any) => ({
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
            const parsed = JSON.parse(storedCats);
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
            loadedFamilies = data.map((f: any) => ({
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
            const parsed = JSON.parse(storedFams);
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

            loadedProducts = data.map((item: any) => {
              let images: string[] = item.images || [];
              const mockProd = MOCK_PRODUCTS.find((m) => m.id === item.id);
              const firstImg = images[0] || "";
              const hasLegacyImg =
                Boolean(mockProd) &&
                LEGACY_IMAGE_SNIPPETS.some((snippet) => firstImg.includes(snippet));

              if (mockProd && hasLegacyImg) {
                images = mockProd.images;
                // Auto-guérison en direct dans Supabase
                client
                  .from("products")
                  .update({ images: mockProd.images })
                  .eq("id", mockProd.id)
                  .then(({ error: updateErr }) => {
                    if (updateErr) {
                      console.warn(`Erreur de curation d'image pour ${mockProd.id}:`, updateErr);
                    }
                  });
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
                concentration_info: item.concentration_info,
                base_price: Number(item.base_price),
                images,
                is_active: item.is_active,
                featured: item.featured,
                variants:
                  item.product_variants?.map((v: any) => ({
                    id: v.id,
                    sku: v.sku,
                    size_label: v.size_label,
                    price: Number(v.price),
                    in_stock: v.in_stock,
                  })) || [],
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

      // Repli localStorage pour les produits
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
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

  // 2. Écouter les modifications multi-onglets en local
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_PRODUCTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
            setIsCustomized(true);
          }
        } catch {
          // Ignorer
        }
      } else if (e.key === STORAGE_KEY_CATEGORIES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCategories(parsed);
        } catch {
          // Ignorer
        }
      } else if (e.key === STORAGE_KEY_FAMILIES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setOlfactoryFamilies(parsed);
        } catch {
          // Ignorer
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- ACTIONS PRODUITS & VARIANTES ---

  const addProduct = useCallback(async (newProduct: Product) => {
    // Calcul automatique du base_price selon la variante la plus accessible
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
              },
            ],
    };

    setProducts((prev) => {
      const updated = [productWithVariants, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (e) {
        console.warn("Erreur sauvegarde localStorage", e);
      }
      setIsCustomized(true);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        const { error: prodError } = await client.from("products").insert({
          id: productWithVariants.id,
          category_id: productWithVariants.category_id,
          category_name: productWithVariants.category_name,
          name: productWithVariants.name,
          slug: productWithVariants.slug,
          description: productWithVariants.description,
          scent_notes: productWithVariants.scent_notes,
          olfactory_family: productWithVariants.olfactory_family,
          facets: productWithVariants.facets,
          olfactory_pyramid: productWithVariants.olfactory_pyramid,
          concentration_info: productWithVariants.concentration_info,
          base_price: productWithVariants.base_price,
          images: productWithVariants.images,
          is_active: productWithVariants.is_active,
          featured: productWithVariants.featured || false,
        });

        if (prodError) {
          console.error("Erreur insertion produit Supabase:", prodError);
          return;
        }

        if (productWithVariants.variants && productWithVariants.variants.length > 0) {
          const variantsData = productWithVariants.variants.map((v) => ({
            id: v.id,
            product_id: productWithVariants.id,
            sku: v.sku,
            size_label: v.size_label,
            price: Number(v.price),
            in_stock: v.in_stock ?? true,
          }));

          await client.from("product_variants").insert(variantsData);
        }
      } catch (err) {
        console.error("Erreur réseau Supabase lors de l'ajout:", err);
      }
    }
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

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === finalizedProduct.id ? finalizedProduct : p));
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (e) {
        console.warn("Erreur sauvegarde localStorage", e);
      }
      setIsCustomized(true);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        // 1. Mettre à jour les données du produit
        await client
          .from("products")
          .update({
            category_id: finalizedProduct.category_id,
            category_name: finalizedProduct.category_name,
            name: finalizedProduct.name,
            slug: finalizedProduct.slug,
            description: finalizedProduct.description,
            scent_notes: finalizedProduct.scent_notes,
            olfactory_family: finalizedProduct.olfactory_family,
            facets: finalizedProduct.facets,
            olfactory_pyramid: finalizedProduct.olfactory_pyramid,
            concentration_info: finalizedProduct.concentration_info,
            base_price: finalizedProduct.base_price,
            images: finalizedProduct.images,
            is_active: finalizedProduct.is_active,
            featured: finalizedProduct.featured || false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", finalizedProduct.id);

        // 2. Réconcilier les variantes (suppression puis réinsertion)
        await client.from("product_variants").delete().eq("product_id", finalizedProduct.id);

        if (finalizedProduct.variants && finalizedProduct.variants.length > 0) {
          const variantsData = finalizedProduct.variants.map((v) => ({
            id: v.id,
            product_id: finalizedProduct.id,
            sku: v.sku,
            size_label: v.size_label,
            price: Number(v.price),
            in_stock: v.in_stock ?? true,
          }));

          await client.from("product_variants").insert(variantsData);
        }
      } catch (err) {
        console.error("Erreur mise à jour Supabase:", err);
      }
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (e) {
        console.warn("Erreur sauvegarde localStorage après suppression", e);
      }
      setIsCustomized(true);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("products").delete().eq("id", productId);
      } catch (err) {
        console.error("Erreur suppression Supabase:", err);
      }
    }
  }, []);

  const toggleStock = useCallback(async (productId: string) => {
    let newStatus = true;
    setProducts((prev) => {
      const current = prev.find((p) => p.id === productId);
      newStatus = current ? !current.is_active : true;

      const updated = prev.map((p) =>
        p.id === productId ? { ...p, is_active: newStatus } : p
      );

      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (e) {
        console.warn("Erreur sauvegarde localStorage", e);
      }
      setIsCustomized(true);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("products")
          .update({ is_active: newStatus, updated_at: new Date().toISOString() })
          .eq("id", productId);
      } catch (err) {
        console.error("Erreur mise à jour stock produit Supabase:", err);
      }
    }
  }, []);

  const toggleVariantStock = useCallback(
    async (productId: string, variantId: string) => {
      let targetNewStatus = true;

      setProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== productId || !p.variants) return p;
          const newVariants = p.variants.map((v) => {
            if (v.id === variantId) {
              targetNewStatus = !v.in_stock;
              return { ...v, in_stock: targetNewStatus };
            }
            return v;
          });
          return { ...p, variants: newVariants };
        });

        try {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
        } catch (e) {
          console.warn("Erreur sauvegarde localStorage", e);
        }
        setIsCustomized(true);
        return updated;
      });

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from("product_variants")
            .update({ in_stock: targetNewStatus })
            .eq("id", variantId);
        } catch (err) {
          console.error("Erreur mise à jour stock variante Supabase:", err);
        }
      }
    },
    []
  );

  // --- ACTIONS CATÉGORIES ---

  const addCategory = useCallback(async (cat: Omit<Category, "id">) => {
    const newId = `cat-${Date.now()}`;
    const newCat: Category = {
      id: newId,
      name: cat.name.trim(),
      slug: cat.slug || cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      description: cat.description || "",
    };

    setCategories((prev) => {
      const updated = [...prev, newCat];
      try {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("categories").insert(newCat);
      } catch (err) {
        console.error("Erreur insertion catégorie Supabase:", err);
      }
    }
  }, []);

  const updateCategory = useCallback(async (cat: Category) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === cat.id ? cat : c));
      try {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // Mettre à jour category_name dans les produits associés
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.category_id === cat.id ? { ...p, category_name: cat.name } : p
      );
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("categories")
          .update({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
          })
          .eq("id", cat.id);

        await supabase
          .from("products")
          .update({ category_name: cat.name })
          .eq("category_id", cat.id);
      } catch (err) {
        console.error("Erreur mise à jour catégorie Supabase:", err);
      }
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== categoryId);
      try {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("categories").delete().eq("id", categoryId);
      } catch (err) {
        console.error("Erreur suppression catégorie Supabase:", err);
      }
    }
  }, []);

  // --- ACTIONS FAMILLES OLFACTIVES ---

  const addOlfactoryFamily = useCallback(async (fam: Omit<OlfactoryFamilyItem, "id">) => {
    const newId = `fam-${Date.now()}`;
    const newFam: OlfactoryFamilyItem = {
      id: newId,
      name: fam.name.trim(),
      mood: fam.mood.trim() || "Accord Signature de Grasse",
      description: fam.description || "",
    };

    setOlfactoryFamilies((prev) => {
      const updated = [...prev, newFam];
      try {
        localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("olfactory_families").insert(newFam);
      } catch (err) {
        console.warn("Table olfactory_families non disponible sur Supabase:", err);
      }
    }
  }, []);

  const updateOlfactoryFamily = useCallback(
    async (fam: OlfactoryFamilyItem, oldName?: string) => {
      setOlfactoryFamilies((prev) => {
        const updated = prev.map((f) => (f.id === fam.id ? fam : f));
        try {
          localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(updated));
        } catch (e) {
          console.warn(e);
        }
        return updated;
      });

      if (oldName && oldName !== fam.name) {
        setProducts((prev) => {
          const updated = prev.map((p) =>
            p.olfactory_family === oldName ? { ...p, olfactory_family: fam.name } : p
          );
          try {
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from("olfactory_families")
            .update({
              name: fam.name,
              mood: fam.mood,
              description: fam.description,
            })
            .eq("id", fam.id);

          if (oldName && oldName !== fam.name) {
            await supabase
              .from("products")
              .update({ olfactory_family: fam.name })
              .eq("olfactory_family", oldName);
          }
        } catch (err) {
          console.warn("Table olfactory_families Supabase:", err);
        }
      }
    },
    []
  );

  const deleteOlfactoryFamily = useCallback(async (familyId: string) => {
    setOlfactoryFamilies((prev) => {
      const updated = prev.filter((f) => f.id !== familyId);
      try {
        localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("olfactory_families").delete().eq("id", familyId);
      } catch (err) {
        console.warn(err);
      }
    }
  }, []);

  // --- RÉINITIALISATION DU CATALOGUE DÉMO ---

  const resetCatalog = useCallback(async () => {
    setProducts(MOCK_PRODUCTS);
    setCategories(CATEGORIES);
    setOlfactoryFamilies(DEFAULT_OLFACTORY_FAMILIES);
    setIsCustomized(false);

    try {
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.removeItem(STORAGE_KEY_FAMILIES);
    } catch (e) {
      console.warn("Erreur suppression localStorage", e);
    }

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const officialIds = [
        "prod-1",
        "prod-2",
        "prod-3",
        "prod-4",
        "prod-5",
        "prod-6",
        "prod-7",
        "prod-8",
      ];

      try {
        // 1. Supprimer les créations additionnelles
        await client
          .from("products")
          .delete()
          .not("id", "in", '("prod-1","prod-2","prod-3","prod-4","prod-5","prod-6","prod-7","prod-8")');

        // 2. Réactiver les 8 produits officiels et restaurer leurs images officielles
        for (const mockProd of MOCK_PRODUCTS) {
          if (officialIds.includes(mockProd.id)) {
            await client
              .from("products")
              .update({
                is_active: true,
                images: mockProd.images,
                updated_at: new Date().toISOString(),
              })
              .eq("id", mockProd.id);
          }
        }

        // 3. Rétablir le stock sur toutes les variantes
        await client
          .from("product_variants")
          .update({ in_stock: true })
          .in("product_id", officialIds);
      } catch (err) {
        console.error("Erreur réinitialisation Supabase:", err);
      }
    }
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
