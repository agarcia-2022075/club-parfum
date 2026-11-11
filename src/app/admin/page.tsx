"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ShoppingBag,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  Eye,
  X,
  Camera,
  RotateCcw,
  Sparkles,
  Lock,
  LogOut,
  Trash2,
  KeyRound,
  Search,
  Printer,
  MessageCircle,
  Pencil,
  Tag,
  Layers,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { formatPrice } from "@/lib/utils";
import { OlfactoryFamily, OlfactoryFamilyItem, Product, ProductVariant, Category } from "@/types/store";
import { getOlfactoryTheme } from "@/lib/olfactory-theme";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AdminOrderItem {
  name: string;
  variant: string;
  qty: number;
  price: number;
}

interface AdminOrder {
  id: string;
  dbId?: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  items: AdminOrderItem[];
  shipping_method: string;
  relay_point?: string | null;
  address?: string | null;
  building?: string | null;
  digicode?: string | null;
  postal_code?: string | null;
  city?: string | null;
  shipping_cost: number;
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled" | string;
  tracking: string;
}

const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: "CP-2026-0042",
    dbId: "ord-demo-42",
    date: "Aujourd'hui à 14:20",
    customer: "Sophie Martin",
    email: "sophie.martin@example.fr",
    phone: "06 12 34 56 78",
    items: [
      { name: "Bougie Ambre Précieux & Vanille", variant: "180 g (env. 45h)", qty: 2, price: 24.90 },
      { name: "Eau de Parfum Fleur de Coton", variant: "Flacon 50 ml", qty: 1, price: 28.00 },
    ],
    shipping_method: "Point Relais (Mondial Relay)",
    relay_point: "Tabac Presse des Fleurs - 75011 Paris (Code: 14209)",
    address: null,
    shipping_cost: 0.0,
    total: 77.8,
    status: "pending",
    tracking: "",
  },
  {
    id: "CP-2026-0041",
    dbId: "ord-demo-41",
    date: "Hier à 19:45",
    customer: "Lucas Bernard",
    email: "lucas.b@example.fr",
    phone: "07 98 76 54 32",
    items: [
      { name: "Diffuseur à Tiges Cèdre de l'Atlas & Sauge", variant: "100 ml + 8 bâtonnets", qty: 1, price: 28.50 },
    ],
    shipping_method: "Colissimo Domicile",
    relay_point: null,
    address: "18 Rue de la Paix, Bât B - Digicode: 2408B, 69002 Lyon",
    postal_code: "69002",
    city: "Lyon",
    shipping_cost: 6.9,
    total: 35.4,
    status: "shipped",
    tracking: "6A14892058190",
  },
  {
    id: "CP-2026-0040",
    dbId: "ord-demo-40",
    date: "14 Oct. à 11:10",
    customer: "Camille Dubois",
    email: "camille.d@example.fr",
    phone: "06 55 44 33 22",
    items: [{ name: "Bougie Fleur d'Oranger & Néroli", variant: "180 g (env. 45h)", qty: 1, price: 24.90 }],
    shipping_method: "Point Relais (Mondial Relay)",
    relay_point: "Épicerie Bio - 31000 Toulouse (Code: 09844)",
    address: null,
    postal_code: "31000",
    city: "Toulouse",
    shipping_cost: 4.5,
    total: 29.4,
    status: "delivered",
    tracking: "MR88392019FR",
  },
];

export default function AdminDashboard() {
  // --- AUTHENTIFICATION GÉRANCE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");

  // --- NAVIGATION PAR ONGLETS ---
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "taxonomies">("orders");

  // --- CATALOGUE CONTEXT ---
  const {
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
    isCustomized,
    isLiveDb,
  } = useCatalog();

  // --- ÉTAT DES COMMANDES ---
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "pending" | "shipped" | "delivered" | "cancelled"
  >("all");
  const [modalTracking, setModalTracking] = useState("");
  const [modalStatus, setModalStatus] = useState<string>("pending");
  const [orderActionFeedback, setOrderActionFeedback] = useState<string | null>(null);

  // --- FILTRES DU CATALOGUE ---
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productFamilyFilter, setProductFamilyFilter] = useState("all");
  const [resetConfirm, setResetConfirm] = useState(false);

  // --- MODAL MAÎTRE PRODUIT (CRÉATION & ÉDITION) ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState("");
  const [pCategoryId, setPCategoryId] = useState("");
  const [pFamily, setPFamily] = useState<string>("Orientale");
  const [pFacets, setPFacets] = useState("");
  const [pConcentration, setPConcentration] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pFeatured, setPFeatured] = useState(false);
  const [pNotes, setPNotes] = useState("");
  const [pTopNotes, setPTopNotes] = useState("");
  const [pHeartNotes, setPHeartNotes] = useState("");
  const [pBaseNotes, setPBaseNotes] = useState("");
  const [pVariants, setPVariants] = useState<ProductVariant[]>([]);
  const [pImageUrl, setPImageUrl] = useState("");
  const [pPreviewImage, setPPreviewImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // --- ÉTAT GESTION TAXONOMIES (CATÉGORIES & FAMILLES) ---
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [newFamName, setNewFamName] = useState("");
  const [newFamMood, setNewFamMood] = useState("");
  const [newFamDesc, setNewFamDesc] = useState("");
  const [editingFamId, setEditingFamId] = useState<string | null>(null);
  const [editingFamOldName, setEditingFamOldName] = useState<string>("");

  // 1. Vérification session
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("club_parfum_admin_auth");
      if (stored === "true") {
        setIsAuthenticated(true);
      }
    } catch {
      // Ignorer
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // 2. Chargement des commandes Supabase
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const mappedOrders: AdminOrder[] = data.map((row: any) => ({
              id: row.order_number || row.id,
              dbId: row.id,
              date: row.date || new Date(row.created_at).toLocaleDateString("fr-FR"),
              customer: row.customer_name || `${row.customer_first_name || ""} ${row.customer_last_name || ""}`.trim() || "Client",
              email: row.customer_email,
              phone: row.customer_phone,
              items: Array.isArray(row.items)
                ? row.items.map((it: any) => ({
                    name: it.name,
                    variant: it.variant,
                    qty: Number(it.qty || 1),
                    price: Number(it.price || 0),
                  }))
                : [],
              shipping_method: row.shipping_method,
              relay_point: row.relay_point,
              address: row.address,
              building: row.building,
              digicode: row.digicode,
              postal_code: row.postal_code,
              city: row.city,
              shipping_cost: Number(row.shipping_cost || 0),
              total: Number(row.total || 0),
              status: row.status || "pending",
              tracking: row.tracking || "",
            }));

            setOrders(mappedOrders);
          }
        });
    }
  }, []);

  // Synchronisation du modal de commande
  useEffect(() => {
    if (selectedOrder) {
      setModalTracking(selectedOrder.tracking || "");
      setModalStatus(selectedOrder.status || "pending");
      setOrderActionFeedback(null);
    }
  }, [selectedOrder]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCode.trim() === "GRASSE2026") {
      setIsAuthenticated(true);
      setAuthError("");
      try {
        sessionStorage.setItem("club_parfum_admin_auth", "true");
      } catch {
        // Ignorer
      }
    } else {
      setAuthError("Code d'accès incorrect. Veuillez renseigner le code d'accès de la gérance.");
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("club_parfum_admin_auth");
    } catch {
      // Ignorer
    }
    setIsAuthenticated(false);
    setAuthCode("");
  };

  // --- KPIs CALCULÉS ---
  const validOrders = useMemo(() => orders.filter((o) => o.status !== "cancelled"), [orders]);
  const totalRevenue = useMemo(() => validOrders.reduce((acc, o) => acc + o.total, 0), [validOrders]);
  const pendingOrdersCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);
  const averageBasket = useMemo(
    () => (validOrders.length > 0 ? totalRevenue / validOrders.length : 0),
    [validOrders, totalRevenue]
  );
  const activeProductsCount = useMemo(() => products.filter((p) => p.is_active).length, [products]);
  const inStockVariantsCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.variants?.filter((v) => v.in_stock).length || 0), 0);
  }, [products]);

  // --- FILTRAGE DES COMMANDES ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const matchId = order.id.toLowerCase().includes(q);
        const matchCustomer = order.customer.toLowerCase().includes(q);
        const matchEmail = order.email.toLowerCase().includes(q);
        const matchPhone = order.phone.includes(q);
        const matchCity = (order.city || "").toLowerCase().includes(q);
        if (!matchId && !matchCustomer && !matchEmail && !matchPhone && !matchCity) {
          return false;
        }
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // --- GESTION DES COMMANDES (SAUVEGARDE & SUPABASE) ---
  const handleSaveOrderChanges = async (overrideStatus?: string) => {
    if (!selectedOrder) return;
    const newStatus = overrideStatus || modalStatus;
    const newTracking = modalTracking.trim();

    // Mettre à jour en local
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id || (o.dbId && o.dbId === selectedOrder.dbId)
          ? { ...o, status: newStatus, tracking: newTracking }
          : o
      )
    );
    setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus, tracking: newTracking } : null));

    // Mettre à jour dans Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const query = supabase
          .from("orders")
          .update({ status: newStatus, tracking: newTracking });

        if (selectedOrder.dbId) {
          await query.or(`id.eq.${selectedOrder.dbId},order_number.eq.${selectedOrder.id}`);
        } else {
          await query.eq("order_number", selectedOrder.id);
        }
      } catch (err) {
        console.error("Erreur mise à jour commande Supabase:", err);
      }
    }

    setOrderActionFeedback("Commande mise à jour avec succès !");
    setTimeout(() => setOrderActionFeedback(null), 2500);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible.")) return;

    setOrders((prev) => prev.filter((o) => o.id !== orderId && o.dbId !== orderId));
    setSelectedOrder(null);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("orders").delete().or(`id.eq.${orderId},order_number.eq.${orderId}`);
      } catch (err) {
        console.error("Erreur suppression commande Supabase:", err);
      }
    }
  };

  const handleWhatsAppNotify = (order: AdminOrder) => {
    let cleanPhone = order.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "33" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("33") && cleanPhone.length === 9) {
      cleanPhone = "33" + cleanPhone;
    }

    const statusLabel =
      order.status === "shipped"
        ? "Expédiée — En cours d'acheminement"
        : order.status === "delivered"
        ? "Livrée"
        : order.status === "cancelled"
        ? "Annulée"
        : "En cours de préparation à l'atelier de Grasse";

    let trackingMsg = "";
    if (order.tracking && order.tracking.trim()) {
      trackingMsg = `\n📦 N° de suivi ${order.shipping_method} : ${order.tracking.trim()}`;
    }

    const message = `Bonjour ${order.customer},\n\nVotre commande Club Parfum #${order.id} est actuellement : *${statusLabel}*.${trackingMsg}\n\nNous vous remercions de votre confiance et restons à votre entière disposition !\n— Maison Club Parfum Grasse`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // --- FILTRAGE DU CATALOGUE ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productCategoryFilter !== "all" && p.category_id !== productCategoryFilter) {
        return false;
      }
      if (productFamilyFilter !== "all" && p.olfactory_family !== productFamilyFilter) {
        return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchNotes = p.scent_notes.some((n) => n.toLowerCase().includes(q));
        const matchFacets = (p.facets || "").toLowerCase().includes(q);
        if (!matchName && !matchNotes && !matchFacets) return false;
      }
      return true;
    });
  }, [products, productCategoryFilter, productFamilyFilter, productSearch]);

  // --- OUVERTURE DU MODAL PRODUIT (CRÉATION OU ÉDITION) ---
  const openCreateProductModal = () => {
    setEditingProduct(null);
    setPName("");
    setPCategoryId(categories[0]?.id || "cat-1");
    setPFamily(olfactoryFamilies[0]?.name || "Orientale");
    setPFacets("Raffiné • Solaire • Élégant");
    setPConcentration("Eau de Parfum (18% de concentré de Grasse)");
    setPDesc("Nouvelle création artisanale élaborée avec passion dans notre atelier à Grasse.");
    setPFeatured(false);
    setPNotes("Bergamote, Fleur d'Oranger, Ambre");
    setPTopNotes("Bergamote d'Italie, Zestes frais");
    setPHeartNotes("Fleurs blanches de Grasse, Néroli");
    setPBaseNotes("Ambre chaud, Bois de Santal");
    setPVariants([
      { id: `var-${Date.now()}-1`, sku: `CP-10`, size_label: "Format Découverte 10 ml", price: 9.9, in_stock: true },
      { id: `var-${Date.now()}-2`, sku: `CP-50`, size_label: "Flacon Vaporisateur 50 ml", price: 28.0, in_stock: true },
      { id: `var-${Date.now()}-3`, sku: `CP-100`, size_label: "Flacon Prestige 100 ml", price: 38.0, in_stock: true },
    ]);
    setPImageUrl("");
    setPPreviewImage(null);
    setUploadStatusMsg(null);
    setIsUploadingImage(false);
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPCategoryId(prod.category_id);
    setPFamily(prod.olfactory_family);
    setPFacets(prod.facets || "");
    setPConcentration(prod.concentration_info || "");
    setPDesc(prod.description || "");
    setPFeatured(prod.featured || false);
    setPNotes((prod.scent_notes || []).join(", "));
    setPTopNotes((prod.olfactory_pyramid?.top_notes || []).join(", "));
    setPHeartNotes((prod.olfactory_pyramid?.heart_notes || []).join(", "));
    setPBaseNotes((prod.olfactory_pyramid?.base_notes || []).join(", "));
    setPVariants(
      prod.variants && prod.variants.length > 0
        ? [...prod.variants]
        : [
            {
              id: `var-${Date.now()}`,
              sku: `CP-${prod.id}`,
              size_label: "Format Unique 50 ml",
              price: prod.base_price,
              in_stock: true,
            },
          ]
    );
    setPImageUrl(prod.images[0] || "");
    setPPreviewImage(prod.images[0] || null);
    setUploadStatusMsg(null);
    setIsUploadingImage(false);
    setShowProductModal(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadStatusMsg("Téléversement vers Supabase Cloud...");

    // 1. Tentative de téléversement sécurisé vers l'API Supabase Storage
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setPPreviewImage(data.url);
          setPImageUrl(data.url);
          setUploadStatusMsg("✓ Image hébergée sur le Cloud Supabase (CDN haute vitesse)");
          setIsUploadingImage(false);
          return;
        }
      } else {
        const errData = await res.json().catch(() => null);
        console.warn("Échec upload Supabase Storage, repli FileReader:", errData?.error);
      }
    } catch (err) {
      console.warn("Erreur réseau vers /api/upload, repli FileReader:", err);
    }

    // 2. Repli de secours local avec FileReader pour ne jamais bloquer l'administrateur
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPPreviewImage(result);
      setPImageUrl(result);
      setUploadStatusMsg("Image chargée localement (mode hors-ligne)");
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Plantilles de variantes
  const applyParfumPack = () => {
    setPVariants([
      { id: `var-${Date.now()}-1`, sku: `EDP-10`, size_label: "Format Découverte 10 ml", price: 9.9, in_stock: true },
      { id: `var-${Date.now()}-2`, sku: `EDP-50`, size_label: "Flacon Vaporisateur 50 ml", price: 28.0, in_stock: true },
      { id: `var-${Date.now()}-3`, sku: `EDP-100`, size_label: "Flacon Prestige 100 ml", price: 38.0, in_stock: true },
    ]);
  };

  const applyBougiePack = () => {
    setPVariants([
      { id: `var-${Date.now()}-1`, sku: `BOU-180`, size_label: "Classique 180 g (env. 45h)", price: 24.9, in_stock: true },
      { id: `var-${Date.now()}-2`, sku: `BOU-300`, size_label: "Grand Modèle 300 g (env. 75h)", price: 34.9, in_stock: true },
    ]);
  };

  const handleAddCustomVariant = () => {
    setPVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        sku: `CP-${Date.now().toString().slice(-4)}`,
        size_label: "Nouveau format",
        price: 24.9,
        in_stock: true,
      },
    ]);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const matchedCat = categories.find((c) => c.id === pCategoryId);
    const categoryName = matchedCat?.name || "Bougies Parfumées";

    const splitNotes = pNotes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const splitTop = pTopNotes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const splitHeart = pHeartNotes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const splitBase = pBaseNotes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const fallbackImg = categoryName.toLowerCase().includes("bougie")
      ? "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800"
      : categoryName.toLowerCase().includes("eau")
      ? "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800"
      : "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800";

    const finalImage = pImageUrl.trim() || fallbackImg;

    const baseMinPrice =
      pVariants.length > 0
        ? Math.min(...pVariants.map((v) => Number(v.price)).filter((p) => !isNaN(p) && p > 0))
        : 24.9;

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      category_id: pCategoryId,
      category_name: categoryName,
      name: pName.trim(),
      slug: editingProduct
        ? editingProduct.slug
        : pName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      description: pDesc.trim() || "Création de haute parfumerie de Grasse.",
      scent_notes: splitNotes.length > 0 ? splitNotes : ["Essences de Grasse"],
      olfactory_family: pFamily as OlfactoryFamily,
      facets: pFacets.trim() || "Élégant • Lumineux",
      olfactory_pyramid: {
        top_notes: splitTop.length > 0 ? splitTop : ["Agrumes frais"],
        heart_notes: splitHeart.length > 0 ? splitHeart : ["Fleurs de Grasse"],
        base_notes: splitBase.length > 0 ? splitBase : ["Bois précieux"],
      },
      concentration_info: pConcentration.trim() || undefined,
      base_price: baseMinPrice,
      images: [finalImage],
      is_active: editingProduct ? editingProduct.is_active : true,
      featured: pFeatured,
      variants: pVariants.length > 0 ? pVariants : undefined,
    };

    if (editingProduct) {
      await updateProduct(productPayload);
    } else {
      await addProduct(productPayload);
    }

    setShowProductModal(false);
  };

  const handleResetCatalog = async () => {
    await resetCatalog();
    setResetConfirm(true);
    setTimeout(() => setResetConfirm(false), 2500);
  };

  // --- ACTIONS CATÉGORIES ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (editingCatId) {
      const existing = categories.find((c) => c.id === editingCatId);
      if (existing) {
        await updateCategory({
          ...existing,
          name: newCatName.trim(),
          slug: newCatName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
          description: newCatDesc.trim(),
        });
      }
      setEditingCatId(null);
    } else {
      await addCategory({
        name: newCatName.trim(),
        slug: newCatName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
        description: newCatDesc.trim(),
      });
    }

    setNewCatName("");
    setNewCatDesc("");
  };

  // --- ACTIONS FAMILLES OLFACTIVES ---
  const handleSaveFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamName.trim()) return;

    if (editingFamId) {
      await updateOlfactoryFamily(
        {
          id: editingFamId,
          name: newFamName.trim(),
          mood: newFamMood.trim() || "Accord Signature de Grasse",
          description: newFamDesc.trim(),
        },
        editingFamOldName
      );
      setEditingFamId(null);
      setEditingFamOldName("");
    } else {
      await addOlfactoryFamily({
        name: newFamName.trim(),
        mood: newFamMood.trim() || "Accord Signature de Grasse",
        description: newFamDesc.trim(),
      });
    }

    setNewFamName("");
    setNewFamMood("");
    setNewFamDesc("");
  };

  // Écran d'attente d'hydratation
  if (isCheckingAuth) {
    return <div className="min-h-screen bg-[#FAFAF8]" />;
  }

  // ÉCRAN DE VERROUILLAGE SÉCURISÉ
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#FAFAF8] text-[#1C1917] px-4 py-8">
        <header className="max-w-md mx-auto w-full flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#57534E] hover:text-[#1C1917] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Boutique Club Parfum</span>
          </Link>
          <span className="text-xs uppercase tracking-widest text-[#A16207] font-semibold">
            Grasse • France
          </span>
        </header>

        <main className="max-w-md mx-auto w-full my-auto">
          <div className="bg-white rounded-3xl p-8 border border-[#E7E2DA] shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F2EFE9] border border-[#E7E2DA] text-[#A16207] flex items-center justify-center mx-auto shadow-xs">
              <KeyRound className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#A16207] font-semibold block">
                Espace Réservé • Gérance
              </span>
              <h1 className="font-serif text-3xl font-medium text-[#1C1917]">
                Back-Office Club Parfum
              </h1>
              <p className="text-sm text-[#57534E] leading-relaxed max-w-xs mx-auto">
                Veuillez renseigner votre code d&apos;accès artisane pour gérer les commandes et le catalogue en direct.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Code d&apos;Accès Gérante
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Entrez votre code secret"
                    value={authCode}
                    onChange={(e) => {
                      setAuthCode(e.target.value);
                      if (authError) setAuthError("");
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:ring-1 focus:ring-[#A16207] focus:outline-none text-sm bg-[#FAFAF8]"
                  />
                  <Lock className="w-4 h-4 text-[#57534E] absolute right-3.5 top-3.5" />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-semibold rounded-xl uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
              >
                Déverrouiller l&apos;Espace Gestion
              </button>
            </form>

            <div className="pt-2 border-t border-[#F2EFE9] text-center">
              <p className="text-xs text-[#57534E]">
                Accès restreint aux artisans et gestionnaires Club Parfum.
              </p>
              <p className="text-xs text-[#A16207] font-medium mt-1">
                Code d&apos;accès démo : <code className="bg-[#F2EFE9] px-2 py-0.5 rounded font-mono font-bold">GRASSE2026</code>
              </p>
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-[#57534E]">
          Maison Club Parfum • Grasse Haute Parfumerie Artisanale
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1917] flex flex-col">
      {/* HEADER DE GÉRANCE */}
      <header className="bg-white border-b border-[#E7E2DA] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 text-[#57534E] hover:text-[#1C1917] rounded-xl hover:bg-[#F2EFE9] transition"
              title="Retourner à la boutique publique"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#1C1917]">
                  CLUB PARFUM
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#F5F2EB] text-[#A16207] border border-[#E7E2DA] rounded-full uppercase tracking-wider">
                  Back-Office
                </span>
                {isLiveDb ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Supabase Connecté</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <span>Cache Local</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#57534E]">
                Atelier de Création & Expéditions • Grasse, France
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/boutique"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-[#E7E2DA] rounded-xl text-xs font-medium text-[#1C1917] hover:bg-[#F5F2EB] transition"
            >
              <span>Voir la boutique</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition cursor-pointer"
              title="Verrouiller la session"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* BARRE DES 3 ONGLETS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-[#F2EFE9] pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-[#A16207] text-[#A16207] font-semibold"
                : "border-transparent text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Commandes & Expéditions</span>
            {pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#A16207] text-white">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "products"
                ? "border-[#A16207] text-[#A16207] font-semibold"
                : "border-transparent text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catalogue, Formats & Stocks</span>
            <span className="text-xs bg-[#F2EFE9] text-[#57534E] px-2 py-0.5 rounded-full">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("taxonomies")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "taxonomies"
                ? "border-[#A16207] text-[#A16207] font-semibold"
                : "border-transparent text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catégories & Familles Olfactives</span>
          </button>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* BARRE SUPERIEURE DE 4 KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E7E2DA] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span className="uppercase tracking-wider font-semibold">Chiffre d&apos;Affaires</span>
              <TrendingUp className="w-4 h-4 text-[#A16207]" />
            </div>
            <p className="font-serif text-3xl font-normal text-[#1C1917]">
              {formatPrice(totalRevenue)}
            </p>
            <p className="text-xs text-[#57534E]">Total commandes validées</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E2DA] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span className="uppercase tracking-wider font-semibold">À Préparer</span>
              <Clock className="w-4 h-4 text-[#A16207]" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-serif text-3xl font-normal text-[#1C1917]">{pendingOrdersCount}</p>
              {pendingOrdersCount > 0 && (
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                  Colis en attente
                </span>
              )}
            </div>
            <p className="text-xs text-[#57534E]">Commandes en cours d&apos;atelier</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E2DA] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span className="uppercase tracking-wider font-semibold">Panier Moyen</span>
              <Sparkles className="w-4 h-4 text-[#A16207]" />
            </div>
            <p className="font-serif text-3xl font-normal text-[#1C1917]">
              {formatPrice(averageBasket)}
            </p>
            <p className="text-xs text-[#57534E]">Moyenne par panier confirmé</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E2DA] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span className="uppercase tracking-wider font-semibold">Catalogue Actif</span>
              <SlidersHorizontal className="w-4 h-4 text-[#A16207]" />
            </div>
            <p className="font-serif text-3xl font-normal text-[#1C1917]">
              {activeProductsCount} <span className="text-lg font-sans text-[#57534E]">/ {products.length}</span>
            </p>
            <p className="text-xs text-[#57534E]">
              {inStockVariantsCount} formats en stock immédiat
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PESTAÑA 1 : COMMANDES & EXPÉDITIONS (CENTRO LOGÍSTICO) */}
        {/* ============================================================ */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Barre de recherche & filtres par état */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E2DA] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Rechercher par client, e-mail, téléphone, ville ou N°..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                  <Search className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: "all", label: "Toutes", count: orders.length },
                      {
                        id: "pending",
                        label: "À préparer",
                        count: orders.filter((o) => o.status === "pending").length,
                      },
                      {
                        id: "shipped",
                        label: "Expédiées",
                        count: orders.filter((o) => o.status === "shipped").length,
                      },
                      {
                        id: "delivered",
                        label: "Livrées",
                        count: orders.filter((o) => o.status === "delivered").length,
                      },
                      {
                        id: "cancelled",
                        label: "Annulées",
                        count: orders.filter((o) => o.status === "cancelled").length,
                      },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(btn.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer flex items-center gap-1.5 border ${
                        orderStatusFilter === btn.id
                          ? "bg-[#1C1917] text-white border-[#1C1917] shadow-xs"
                          : "bg-[#FAFAF8] text-[#57534E] border-[#E7E2DA] hover:border-[#1C1917]"
                      }`}
                    >
                      <span>{btn.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          orderStatusFilter === btn.id ? "bg-white/20 text-white" : "bg-[#F2EFE9] text-[#1C1917]"
                        }`}
                      >
                        {btn.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Liste des commandes sous forme de cartes d'expédition riches */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isPending = order.status === "pending";
                  const isShipped = order.status === "shipped";
                  const isDelivered = order.status === "delivered";
                  const isCancelled = order.status === "cancelled";

                  return (
                    <div
                      key={order.id}
                      className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7E2DA] shadow-xs hover:border-[#A16207]/40 transition space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2EFE9]">
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-lg font-bold text-[#1C1917]">
                            #{order.id}
                          </span>
                          <span className="text-xs text-[#57534E]">• {order.date}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              isPending
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : isShipped
                                ? "bg-blue-100 text-blue-900 border border-blue-200"
                                : isDelivered
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                : "bg-neutral-100 text-neutral-700 border border-neutral-300"
                            }`}
                          >
                            {isPending
                              ? "À préparer"
                              : isShipped
                              ? "Expédiée"
                              : isDelivered
                              ? "Livrée"
                              : "Annulée"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppNotify(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                            title="Contacter le client sur WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#1C1917] hover:bg-[#A16207] text-white transition shadow-xs cursor-pointer"
                          >
                            <span>Gérer / Expédier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-sm">
                        {/* Coordonnées & Livraison */}
                        <div className="md:col-span-5 space-y-1">
                          <p className="font-semibold text-[#1C1917]">{order.customer}</p>
                          <p className="text-xs text-[#57534E]">
                            <a href={`mailto:${order.email}`} className="hover:underline">
                              {order.email}
                            </a>{" "}
                            •{" "}
                            <a href={`tel:${order.phone}`} className="hover:underline font-mono">
                              {order.phone}
                            </a>
                          </p>
                          <div className="pt-1 text-xs text-[#44403C] space-y-0.5">
                            <p className="font-medium text-[#A16207]">{order.shipping_method}</p>
                            {order.relay_point ? (
                              <p className="text-[#57534E]">Point Relais : {order.relay_point}</p>
                            ) : (
                              <p className="text-[#57534E]">
                                {order.address || "Adresse non renseignée"}
                                {order.postal_code && ` (${order.postal_code} ${order.city || ""})`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Articles commandés */}
                        <div className="md:col-span-5 space-y-1 border-t md:border-t-0 md:border-l border-[#F2EFE9] md:pl-4">
                          <p className="text-xs uppercase tracking-wider text-[#57534E] font-semibold mb-1">
                            Articles ({order.items.reduce((a, b) => a + b.qty, 0)})
                          </p>
                          <ul className="space-y-1">
                            {order.items.map((it, idx) => (
                              <li key={idx} className="flex justify-between text-xs text-[#1C1917]">
                                <span className="line-clamp-1">
                                  <strong>{it.qty}x</strong> {it.name} ({it.variant})
                                </span>
                                <span className="font-mono text-[#57534E] shrink-0 ml-2">
                                  {formatPrice(it.price * it.qty)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Total & Numéro de suivi */}
                        <div className="md:col-span-2 text-right flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#F2EFE9] md:pl-4">
                          <div>
                            <span className="text-xs text-[#57534E] block">Total Réglé</span>
                            <span className="font-serif text-xl font-bold text-[#1C1917]">
                              {formatPrice(order.total)}
                            </span>
                          </div>

                          {order.tracking ? (
                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-800 border border-blue-200">
                              Suivi : {order.tracking}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#57534E]/60 italic mt-2">
                              Aucun suivi saisi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E7E2DA] p-8 space-y-3">
                <p className="font-serif text-2xl text-[#1C1917]">Aucune commande ne correspond</p>
                <p className="text-sm text-[#57534E]">
                  Modifiez votre filtre d&apos;état ou réinitialisez le champ de recherche.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* PESTAÑA 2 : CATALOGUE, FORMATS & STOCKS (CRUD COMPLETO) */}
        {/* ============================================================ */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Barre d'outils du catalogue */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E2DA] shadow-xs flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative min-w-[240px] flex-1">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Filtrer créations, notes..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                  <Search className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-sm bg-white text-[#1C1917]"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={productFamilyFilter}
                  onChange={(e) => setProductFamilyFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-sm bg-white text-[#1C1917]"
                >
                  <option value="all">Toutes familles</option>
                  {olfactoryFamilies.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCatalog}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9] transition cursor-pointer"
                  title="Restaurer le catalogue original de Grasse"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{resetConfirm ? "Catalogue réinitialisé !" : "Réinitialiser démo"}</span>
                </button>

                <button
                  type="button"
                  onClick={openCreateProductModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-medium rounded-xl transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle Création</span>
                </button>
              </div>
            </div>

            {/* Grille des produits administratifs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((prod) => {
                const theme = getOlfactoryTheme(prod.olfactory_family);

                return (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between transition ${
                      prod.is_active ? "border-[#E7E2DA]" : "border-[#E7E2DA] bg-[#FAFAF8] opacity-75"
                    }`}
                  >
                    <div>
                      {/* En-tête de carte produit */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F2EFE9] border border-[#E7E2DA] shrink-0">
                          <Image
                            src={prod.images[0] || "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=400"}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F2EFE9] text-[#1C1917]">
                              {prod.category_name}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${theme.bg} ${theme.text} ${theme.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                              <span>{prod.olfactory_family}</span>
                            </span>
                            {prod.featured && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                                ★ Vedette
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-lg font-medium text-[#1C1917] truncate">
                            {prod.name}
                          </h3>
                          <p className="text-xs text-[#57534E] line-clamp-1">{prod.facets}</p>
                          <p className="font-serif text-base font-bold text-[#1C1917] mt-1">
                            Dès {formatPrice(prod.base_price)}
                          </p>
                        </div>
                      </div>

                      {/* GESTIONNAIRE DE VARIANTES INTERACTIF EN DIRECT SUR LA CARTE */}
                      <div className="pt-3 border-t border-[#F2EFE9] mb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#57534E]">
                          <span className="font-semibold uppercase tracking-wider">
                            Formats & Disponibilité ({prod.variants?.length || 0}) :
                          </span>
                          <span className="text-[11px] italic">Cliquez pour allumer/éteindre</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {prod.variants?.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => toggleVariantStock(prod.id, v.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                                v.in_stock
                                  ? "bg-white text-[#1C1917] border-[#E7E2DA] hover:border-[#1C1917] shadow-2xs"
                                  : "bg-[#F2EFE9] text-[#57534E]/60 border-dashed border-[#DCD5C9] line-through"
                              }`}
                              title={v.in_stock ? "En stock (Cliquer pour marquer Épuisé)" : "Épuisé (Cliquer pour remettre En stock)"}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  v.in_stock ? "bg-emerald-600" : "bg-neutral-400"
                                }`}
                              />
                              <span>
                                {v.size_label} — <strong>{formatPrice(v.price)}</strong>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS DE CARTE PRODUIT */}
                    <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => toggleStock(prod.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer border ${
                          prod.is_active
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200"
                        }`}
                      >
                        {prod.is_active ? "En vente (Actif)" : "Masqué (Inactif)"}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(prod)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F2EB] text-[#1C1917] hover:bg-[#E7E2DA] transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Supprimer définitivement "${prod.name}" ?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Supprimer ce produit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PESTAÑA 3 : CATÉGORIES & FAMILLES OLFACTIVES (TAXONOMÍAS) */}
        {/* ============================================================ */}
        {activeTab === "taxonomies" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* COLONNE 1 : CATÉGORIES */}
            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] shadow-xs space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A16207] font-semibold block mb-1">
                  Structure du Catalogue
                </span>
                <h2 className="font-serif text-2xl text-[#1C1917]">Catégories de la Boutique</h2>
                <p className="text-xs text-[#57534E]">
                  Gérez les univers de la boutique (Bougies, Parfums, Maison & Brumes).
                </p>
              </div>

              {/* Formulaire ajout / édition catégorie */}
              <form
                onSubmit={handleSaveCategory}
                className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E7E2DA] space-y-3 text-xs"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-[#1C1917]">
                    {editingCatId ? "Modifier la catégorie" : "Ajouter une catégorie"}
                  </h4>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null);
                        setNewCatName("");
                        setNewCatDesc("");
                      }}
                      className="text-xs text-[#A16207] underline cursor-pointer"
                    >
                      Annuler
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[#1C1917] font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Coffrets Cadeaux"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[#1C1917] font-medium mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Courte description éditoriale..."
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1C1917] hover:bg-[#A16207] text-white font-semibold rounded-xl uppercase tracking-wider transition cursor-pointer"
                >
                  {editingCatId ? "Enregistrer les modifications" : "+ Ajouter cette catégorie"}
                </button>
              </form>

              {/* Liste des catégories */}
              <div className="space-y-3">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id).length;

                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-xl border border-[#E7E2DA] flex items-center justify-between gap-4 bg-white"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-base font-semibold text-[#1C1917]">{cat.name}</h3>
                          <span className="text-[11px] font-mono text-[#57534E] bg-[#F2EFE9] px-2 py-0.5 rounded-full">
                            {count} création{count > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-xs text-[#57534E] mt-0.5">{cat.description || "Aucune description"}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setNewCatName(cat.name);
                            setNewCatDesc(cat.description);
                          }}
                          className="p-1.5 text-[#57534E] hover:text-[#1C1917] rounded-lg hover:bg-[#F2EFE9] transition cursor-pointer"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (count > 0) {
                              alert(`Attention : ${count} produit(s) sont rattachés à cette catégorie. Veuillez les réassigner avant suppression.`);
                              return;
                            }
                            if (confirm(`Supprimer la catégorie "${cat.name}" ?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLONNE 2 : FAMILLES OLFACTIVES */}
            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] shadow-xs space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A16207] font-semibold block mb-1">
                  Nomenclature de Grasse
                </span>
                <h2 className="font-serif text-2xl text-[#1C1917]">Familles Olfactives & Accords</h2>
                <p className="text-xs text-[#57534E]">
                  Gérez les familles sensorielles affichées en boutique et dans le diagnostic.
                </p>
              </div>

              {/* Formulaire ajout / édition famille */}
              <form
                onSubmit={handleSaveFamily}
                className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E7E2DA] space-y-3 text-xs"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-[#1C1917]">
                    {editingFamId ? "Modifier la famille olfactive" : "Ajouter une famille olfactive"}
                  </h4>
                  {editingFamId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFamId(null);
                        setEditingFamOldName("");
                        setNewFamName("");
                        setNewFamMood("");
                        setNewFamDesc("");
                      }}
                      className="text-xs text-[#A16207] underline cursor-pointer"
                    >
                      Annuler
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#1C1917] font-medium mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Cuirée"
                      value={newFamName}
                      onChange={(e) => setNewFamName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[#1C1917] font-medium mb-1">Atmosphère / Mood *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Fumé & Charnel"
                      value={newFamMood}
                      onChange={(e) => setNewFamMood(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#1C1917] font-medium mb-1">Description olfactive</label>
                  <input
                    type="text"
                    placeholder="Accords dominants, matières premières..."
                    value={newFamDesc}
                    onChange={(e) => setNewFamDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1C1917] hover:bg-[#A16207] text-white font-semibold rounded-xl uppercase tracking-wider transition cursor-pointer"
                >
                  {editingFamId ? "Enregistrer les modifications" : "+ Ajouter cette famille olfactive"}
                </button>
              </form>

              {/* Liste des familles olfactives */}
              <div className="space-y-3">
                {olfactoryFamilies.map((fam) => {
                  const theme = getOlfactoryTheme(fam.name);
                  const count = products.filter((p) => p.olfactory_family === fam.name).length;

                  return (
                    <div
                      key={fam.id}
                      className="p-4 rounded-xl border border-[#E7E2DA] flex items-center justify-between gap-4 bg-white"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${theme.bg} ${theme.text} ${theme.border}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                            <span>{fam.name}</span>
                          </span>
                          <span className="text-xs text-[#57534E] font-medium">• {fam.mood}</span>
                          <span className="text-[11px] font-mono text-[#57534E] bg-[#F2EFE9] px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        </div>
                        {fam.description && (
                          <p className="text-xs text-[#57534E] mt-1">{fam.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFamId(fam.id);
                            setEditingFamOldName(fam.name);
                            setNewFamName(fam.name);
                            setNewFamMood(fam.mood);
                            setNewFamDesc(fam.description || "");
                          }}
                          className="p-1.5 text-[#57534E] hover:text-[#1C1917] rounded-lg hover:bg-[#F2EFE9] transition cursor-pointer"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Supprimer la famille "${fam.name}" ?`)) {
                              deleteOlfactoryFamily(fam.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* MODAL GESTION / EXPÉDITION COMMANDE (CENTRO LOGÍSTICO) */}
      {/* ============================================================ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl my-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#E7E2DA]">
            {/* Entête du modal */}
            <div className="flex items-start justify-between pb-4 border-b border-[#F2EFE9]">
              <div>
                <span className="text-xs text-[#A16207] font-bold uppercase tracking-wider block">
                  Centre Logistique Atelier
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                  Commande #{selectedOrder.id}
                </h3>
                <p className="text-xs text-[#57534E]">{selectedOrder.date}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-xl border border-[#E7E2DA] hover:bg-[#F2EFE9] text-[#1C1917] transition cursor-pointer"
                  title="Imprimer le bon de préparation"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-[#57534E] hover:text-[#1C1917] rounded-xl hover:bg-[#F2EFE9] transition cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification de mise à jour */}
            {orderActionFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{orderActionFeedback}</span>
              </div>
            )}

            {/* CONTENU DE LA COMMANDE */}
            <div className="space-y-5 text-sm">
              {/* Coordonnées Client */}
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E7E2DA] space-y-2">
                <p className="font-semibold text-[#1C1917]">{selectedOrder.customer}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#57534E]">
                  <p>E-mail : {selectedOrder.email}</p>
                  <p>Téléphone : {selectedOrder.phone}</p>
                </div>
                <div className="pt-2 border-t border-[#E7E2DA] text-xs">
                  <p className="font-medium text-[#A16207]">{selectedOrder.shipping_method}</p>
                  {selectedOrder.relay_point ? (
                    <p className="text-[#44403C]">Lieu de retrait : {selectedOrder.relay_point}</p>
                  ) : (
                    <p className="text-[#44403C]">
                      Adresse : {selectedOrder.address || "Non renseignée"}
                      {selectedOrder.building && ` (Bâtiment: ${selectedOrder.building})`}
                      {selectedOrder.digicode && ` (Digicode: ${selectedOrder.digicode})`}
                      {selectedOrder.postal_code && ` • ${selectedOrder.postal_code} ${selectedOrder.city}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Articles & Totaux */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#57534E] mb-2">
                  Articles à Préparer
                </h4>
                <div className="border border-[#E7E2DA] rounded-xl divide-y divide-[#F2EFE9] overflow-hidden">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-medium text-[#1C1917]">{it.name}</p>
                        <p className="text-[#57534E]">Format : {it.variant} • Qté : <strong>{it.qty}</strong></p>
                      </div>
                      <span className="font-mono font-semibold text-[#1C1917]">
                        {formatPrice(it.price * it.qty)}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-[#FAFAF8] flex justify-between items-center text-xs">
                    <span className="text-[#57534E]">Frais de port ({selectedOrder.shipping_method})</span>
                    <span>{selectedOrder.shipping_cost === 0 ? "Offerts" : formatPrice(selectedOrder.shipping_cost)}</span>
                  </div>
                  <div className="p-3 bg-[#F5F2EB] flex justify-between items-center text-sm font-bold text-[#1C1917]">
                    <span>Total Réglé (TTC)</span>
                    <span className="font-serif text-lg">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* GESTION DU STATUT & NUMÉRO DE SUIVI */}
              <div className="p-4 rounded-xl border border-[#E7E2DA] space-y-4 bg-white">
                <h4 className="font-semibold text-sm text-[#1C1917]">Statut de Traitement & Expédition</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">
                      Changer l&apos;état :
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs bg-white focus:border-[#A16207]"
                    >
                      <option value="pending">À préparer en atelier</option>
                      <option value="shipped">Expédiée — En transit</option>
                      <option value="delivered">Livrée au client</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">
                      N° de Suivi Colissimo / Mondial Relay :
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : 6A14892058190"
                      value={modalTracking}
                      onChange={(e) => setModalTracking(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs font-mono focus:border-[#A16207]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveOrderChanges()}
                    className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-xs"
                  >
                    Enregistrer les modifications
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveOrderChanges("shipped")}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Enregistrer & Marquer Expédiée</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppNotify(selectedOrder)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Notifier le client sur WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* SUPPRESSION DE LA COMMANDE */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-[#57534E]">Suppression réservée aux commandes tests</span>
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="text-red-600 hover:text-red-800 underline font-medium cursor-pointer"
                >
                  Supprimer définitivement cette commande
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL MAÎTRE PRODUIT (CRÉATION ET ÉDITION COMPLÈTE) */}
      {/* ============================================================ */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl my-8 space-y-6 max-h-[92vh] overflow-y-auto border border-[#E7E2DA]">
            <div className="flex items-start justify-between pb-4 border-b border-[#F2EFE9]">
              <div>
                <span className="text-xs text-[#A16207] font-bold uppercase tracking-wider block">
                  {editingProduct ? "Édition Artisanale" : "Nouvelle Création"}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                  {editingProduct ? `Modifier : ${editingProduct.name}` : "Ajouter une Création de Grasse"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-2 text-[#57534E] hover:text-[#1C1917] rounded-xl hover:bg-[#F2EFE9] transition cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-sm">
              {/* 1. DONNÉES PRINCIPALES */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-[#1C1917] uppercase tracking-wider text-xs text-[#A16207]">
                  1. Renseignements Généraux
                </h4>

                <div>
                  <label className="block font-medium text-[#1C1917] mb-1">Nom de la création *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Bougie Ambre Précieux & Vanille"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#1C1917] mb-1">Catégorie *</label>
                    <select
                      value={pCategoryId}
                      onChange={(e) => setPCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#1C1917] mb-1">Famille Olfactive *</label>
                    <select
                      value={pFamily}
                      onChange={(e) => setPFamily(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm bg-white"
                    >
                      {olfactoryFamilies.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name} ({f.mood})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#1C1917] mb-1">Facettes (sous-titre)</label>
                    <input
                      type="text"
                      placeholder="Ex : Ambré • Suave • Boisé"
                      value={pFacets}
                      onChange={(e) => setPFacets(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#1C1917] mb-1">Info technique / Concentration</label>
                    <input
                      type="text"
                      placeholder="Ex : Cire 100% végétale ou Eau de Parfum 18%"
                      value={pConcentration}
                      onChange={(e) => setPConcentration(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#1C1917] mb-1">Description sensorielle *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Description de l'ambiance, de la tenue et de la pyramide olfactive..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] text-sm leading-relaxed"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1C1917]">
                    <input
                      type="checkbox"
                      checked={pFeatured}
                      onChange={(e) => setPFeatured(e.target.checked)}
                      className="rounded text-[#A16207] focus:ring-[#A16207]"
                    />
                    <span className="font-medium">
                      Mettre en avant sur la page d&apos;accueil (Création Vedette / Best-Seller)
                    </span>
                  </label>
                </div>
              </div>

              {/* 2. PYRAMIDE OLFACTIVE */}
              <div className="space-y-4 pt-4 border-t border-[#F2EFE9]">
                <h4 className="font-semibold text-sm text-[#1C1917] uppercase tracking-wider text-xs text-[#A16207]">
                  2. Pyramide Olfactive & Notes de Grasse
                </h4>

                <div>
                  <label className="block text-xs font-medium text-[#1C1917] mb-1">
                    Notes principales résumées (séparées par une virgule)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Ambre chaud, Vanille Bourbon, Bois de Santal"
                    value={pNotes}
                    onChange={(e) => setPNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E7E2DA] text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">
                      01. Notes de Tête
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Bergamote, Zestes"
                      value={pTopNotes}
                      onChange={(e) => setPTopNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">
                      02. Notes de Cœur
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Néroli, Fleur d'Oranger"
                      value={pHeartNotes}
                      onChange={(e) => setPHeartNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">
                      03. Notes de Fond
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Ambre, Santal, Vanille"
                      value={pBaseNotes}
                      onChange={(e) => setPBaseNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. GESTOR DINÁMICO DE MEDIDAS / FORMATOS (CRÍTICO) */}
              <div className="space-y-4 pt-4 border-t border-[#F2EFE9]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-[#1C1917] uppercase tracking-wider text-xs text-[#A16207]">
                      3. Formats, Contenances & Tarifs ({pVariants.length})
                    </h4>
                    <p className="text-xs text-[#57534E]">
                      Définissez les mesures vendues en boutique (ex : 10 ml, 50 ml, 100 ml ou 180 g).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={applyParfumPack}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#1C1917] hover:bg-[#E7E2DA] transition"
                    >
                      + Pack Parfum (10/50/100ml)
                    </button>
                    <button
                      type="button"
                      onClick={applyBougiePack}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#1C1917] hover:bg-[#E7E2DA] transition"
                    >
                      + Pack Bougie (180/300g)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomVariant}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1C1917] text-white hover:bg-[#A16207] transition"
                    >
                      + Ajouter une mesure
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {pVariants.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3 rounded-xl border border-[#E7E2DA] bg-[#FAFAF8] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-medium text-[#57534E] mb-0.5">
                          Format / Mesure
                        </label>
                        <input
                          type="text"
                          required
                          value={v.size_label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, size_label: val } : item))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E7E2DA] bg-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium text-[#57534E] mb-0.5">
                          Prix (€ TTC)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={v.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E7E2DA] bg-white text-xs font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-[#57534E] mb-0.5">
                          SKU Référence
                        </label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E7E2DA] bg-white text-xs font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-3 sm:pt-4">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.in_stock}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setPVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, in_stock: checked } : item))
                              );
                            }}
                            className="rounded text-[#A16207]"
                          />
                          <span className={v.in_stock ? "text-emerald-800 font-semibold text-[11px]" : "text-neutral-500 text-[11px]"}>
                            {v.in_stock ? "En stock" : "Épuisé"}
                          </span>
                        </label>

                        {pVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPVariants((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Supprimer cette mesure"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. PHOTOGRAPHIE DU PRODUIT */}
              <div className="space-y-3 pt-4 border-t border-[#F2EFE9]">
                <h4 className="font-semibold text-sm text-[#1C1917] uppercase tracking-wider text-xs text-[#A16207]">
                  4. Photographie de la Création
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">
                      URL de l&apos;image (ex: Unsplash) :
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={pImageUrl}
                      onChange={(e) => {
                        setPImageUrl(e.target.value);
                        setPPreviewImage(e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E2DA] text-xs focus:border-[#A16207]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">
                      Ou téléverser depuis l&apos;ordinateur :
                    </label>
                    <label className="w-full py-2 px-3 border border-[#E7E2DA] hover:border-[#A16207] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-[#FAFAF8] text-[#57534E] hover:text-[#1C1917] transition text-xs">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 text-[#A16207] animate-spin" />
                          <span className="text-[#A16207] font-medium">Téléversement vers Supabase Storage...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-[#A16207]" />
                          <span>Choisir une photo locale (Cloud CDN)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        disabled={isUploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Message d'état du téléversement */}
                {uploadStatusMsg && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      isUploadingImage
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A16207] shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                    <span>{uploadStatusMsg}</span>
                  </div>
                )}

                {(pPreviewImage || pImageUrl) && (
                  <div className="flex items-start gap-3">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#E7E2DA] shadow-xs group shrink-0">
                      <img
                        src={pPreviewImage || pImageUrl}
                        alt="Prévisualisation"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPImageUrl("");
                          setPPreviewImage(null);
                          setUploadStatusMsg(null);
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black transition cursor-pointer"
                        title="Supprimer la photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-[#57534E] space-y-1">
                      <p className="font-semibold text-[#1C1917]">Aperçu du visuel boutique</p>
                      <p className="text-[11px] leading-relaxed">
                        L&apos;image sera optimisée par le CDN Next.js et Vercel pour garantir un affichage instantané aux visiteurs.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* BOUTON D'ENREGISTREMENT */}
              <div className="pt-4 border-t border-[#F2EFE9] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E7E2DA] text-sm text-[#57534E] hover:bg-[#F2EFE9] transition"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-semibold rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  {editingProduct ? "Mettre à jour le produit" : "Enregistrer et publier en boutique"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
