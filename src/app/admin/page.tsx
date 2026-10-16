"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Package, 
  ShoppingBag, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ChevronRight, 
  ArrowLeft,
  Smartphone,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  Filter,
  AlertCircle
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/mock-data";
import { formatPrice } from "@/lib/utils";

// Mock de pedidos para que la mamá vea cómo se gestionan
const INITIAL_ORDERS = [
  {
    id: "CP-2026-0042",
    date: "Aujourd'hui à 14:20",
    customer: "Sophie Martin",
    email: "sophie.martin@example.fr",
    phone: "06 12 34 56 78",
    items: [
      { name: "Bougie Ambre Précieux & Vanille", variant: "180 g", qty: 2, price: 24.90 },
      { name: "Eau de Parfum Fleur de Coton", variant: "50 ml", qty: 1, price: 38.00 }
    ],
    shipping_method: "Point Relais (Mondial Relay)",
    relay_point: "Tabac Presse des Fleurs - 75011 Paris (Code: 14209)",
    shipping_cost: 4.50,
    total: 92.30,
    status: "pending", // pending | shipped | delivered
    tracking: ""
  },
  {
    id: "CP-2026-0041",
    date: "Hier à 19:45",
    customer: "Lucas Bernard",
    email: "lucas.b@example.fr",
    phone: "07 98 76 54 32",
    items: [
      { name: "Diffuseur à Tiges Cèdre & Sauge", variant: "100 ml", qty: 1, price: 28.50 }
    ],
    shipping_method: "Colissimo Domicile",
    address: "18 Rue de la Paix, Bât B - Digicode: 2408B, 69002 Lyon",
    shipping_cost: 6.90,
    total: 35.40,
    status: "shipped",
    tracking: "6A14892058190"
  },
  {
    id: "CP-2026-0040",
    date: "14 Oct. à 11:10",
    customer: "Camille Dubois",
    email: "camille.d@example.fr",
    phone: "06 55 44 33 22",
    items: [
      { name: "Bougie Fleur d'Oranger & Néroli", variant: "180 g", qty: 1, price: 24.90 }
    ],
    shipping_method: "Point Relais (Mondial Relay)",
    relay_point: "Épicerie Bio - 31000 Toulouse (Code: 09844)",
    shipping_cost: 4.50,
    total: 29.40,
    status: "delivered",
    tracking: "MR88392019FR"
  }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selectedOrder, setSelectedOrder] = useState<typeof INITIAL_ORDERS[0] | null>(null);
  
  // Estado para modal de crear nuevo producto
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Bougies Parfumées");
  const [newProductNotes, setNewProductNotes] = useState("");

  // Alternar disponibilidad rápida de producto
  const toggleStock = (productId: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return { ...p, is_active: !p.is_active };
      }
      return p;
    }));
  };

  // Marcar pedido como enviado
  const markAsShipped = (orderId: string) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: "shipped" };
      }
      return o;
    }));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: "shipped" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] pb-24 sm:pb-12 text-[#2A2421]">
      {/* BARRA SUPERIOR DE ADMINISTRACIÓN */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E8DFD8] px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-1.5 rounded-lg text-[#70655E] hover:bg-[#F2EBE3] transition"
              title="Retour à la boutique"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-medium text-[#2A2421]">Club Parfum</span>
                <span className="bg-[#9C6D49]/10 text-[#9C6D49] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Espace Gestion
                </span>
              </div>
              <p className="text-[11px] text-[#70655E] hidden sm:block">
                Tableau de bord gérant les commandes et produits
              </p>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2A2421] bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl hover:bg-[#F2EBE3] transition"
          >
            <Eye className="w-3.5 h-3.5 text-[#9C6D49]" />
            <span className="hidden sm:inline">Voir la boutique</span>
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* BANNER INFORMATIVO MOBILE */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#FAF8F5] to-[#F2EBE3] border border-[#E8DFD8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#9C6D49]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2A2421]">Accès rapide mobile</p>
              <p className="text-[11px] text-[#70655E]">
                Ajoutez cette page à l'écran d'accueil de votre téléphone pour y accéder comme une application.
              </p>
            </div>
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS (COMMANDES vs PRODUITS) */}
        <div className="flex bg-[#E8DFD8]/60 p-1 rounded-2xl mb-6 max-w-sm mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "orders" 
                ? "bg-white text-[#2A2421] shadow-xs" 
                : "text-[#70655E] hover:text-[#2A2421]"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Commandes</span>
            <span className="bg-[#9C6D49] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {orders.filter(o => o.status === "pending").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition ${
              activeTab === "products" 
                ? "bg-white text-[#2A2421] shadow-xs" 
                : "text-[#70655E] hover:text-[#2A2421]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produits</span>
            <span className="bg-[#FAF8F5] text-[#70655E] text-[10px] px-1.5 py-0.2 rounded-full font-medium">
              {products.length}
            </span>
          </button>
        </div>

        {/* PESTAÑA 1: GESTIÓN DE PEDIDOS (COMMANDES) */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-normal text-[#2A2421]">
                Historique des Commandes
              </h2>
              <span className="text-xs text-[#70655E]">
                {orders.length} commandes au total
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {orders.map((order) => {
                const isPending = order.status === "pending";
                const isShipped = order.status === "shipped";

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD8] hover:border-[#9C6D49]/50 transition cursor-pointer shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#2A2421]">{order.customer}</span>
                          <span className="text-[11px] text-[#70655E] font-mono">#{order.id}</span>
                        </div>
                        <span className="text-xs text-[#70655E] block mt-0.5">{order.date}</span>
                      </div>

                      {/* Badge d'état */}
                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            À préparer
                          </span>
                        )}
                        {isShipped && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Truck className="w-3 h-3" />
                            Expédiée
                          </span>
                        )}
                        {!isPending && !isShipped && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Livrée
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Resumen de artículos y total */}
                    <div className="py-2 border-y border-[#F2EBE3] text-xs text-[#70655E] space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.qty}x {it.name} <span className="text-[11px] text-[#9C6D49]">({it.variant})</span></span>
                          <span className="font-medium text-[#2A2421]">{formatPrice(it.price * it.qty)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#70655E]">
                        <Truck className="w-3.5 h-3.5 text-[#9C6D49]" />
                        <span>{order.shipping_method}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[#70655E] mr-1.5">Total :</span>
                        <span className="font-serif text-base font-bold text-[#2A2421]">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: GESTIÓN DE PRODUCTOS (PRODUITS) */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-normal text-[#2A2421]">
                  Gestion du Catalogue
                </h2>
                <p className="text-xs text-[#70655E]">
                  Activez ou désactivez les articles selon vos stocks
                </p>
              </div>

              <button
                onClick={() => setShowNewProductModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2A2421] hover:bg-[#9C6D49] text-white text-xs font-medium rounded-xl transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau</span>
              </button>
            </div>

            {/* Lista de productos para editar */}
            <div className="grid grid-cols-1 gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8DFD8] flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F2EBE3] shrink-0 border border-[#E8DFD8]">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#9C6D49] font-medium block">
                        {product.category_name}
                      </span>
                      <h4 className="font-medium text-sm text-[#2A2421] truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-serif text-sm font-semibold text-[#2A2421]">
                          {formatPrice(product.base_price)}
                        </span>
                        {product.variants && (
                          <span className="text-[10px] text-[#70655E] bg-[#F2EBE3] px-1.5 py-0.5 rounded">
                            {product.variants.length} formats
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle de Stock con un toque */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleStock(product.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        product.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                      }`}
                    >
                      {product.is_active ? "En vente" : "Épuisé"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL DETALLES DEL PEDIDO (OPTIMIZADO PARA MÓVIL) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-[#F2EBE3]">
              <div>
                <span className="text-xs text-[#9C6D49] font-bold tracking-wider uppercase">Détail Commande</span>
                <h3 className="font-serif text-xl font-medium text-[#2A2421]">{selectedOrder.customer}</h3>
                <p className="text-xs text-[#70655E]">{selectedOrder.date} • #{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#70655E] hover:text-[#2A2421] p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Contacto y Envío */}
            <div className="py-4 space-y-3 text-xs">
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8DFD8] space-y-1">
                <p className="font-semibold text-[#2A2421]">Coordonnées client :</p>
                <p className="text-[#70655E]">Email : <a href={`mailto:${selectedOrder.email}`} className="text-[#9C6D49] underline">{selectedOrder.email}</a></p>
                <p className="text-[#70655E]">Téléphone : <a href={`tel:${selectedOrder.phone}`} className="text-[#9C6D49] underline">{selectedOrder.phone}</a></p>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8DFD8] space-y-1">
                <p className="font-semibold text-[#2A2421]">Mode de livraison :</p>
                <p className="text-[#9C6D49] font-medium">{selectedOrder.shipping_method}</p>
                {selectedOrder.relay_point && (
                  <p className="text-[#70655E]">Point de retrait : <span className="font-medium text-[#2A2421]">{selectedOrder.relay_point}</span></p>
                )}
                {selectedOrder.address && (
                  <p className="text-[#70655E]">Adresse : <span className="font-medium text-[#2A2421]">{selectedOrder.address}</span></p>
                )}
              </div>

              {/* Lista de productos pedidos */}
              <div className="pt-2">
                <p className="font-semibold text-[#2A2421] mb-2">Articles commandés :</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-[#F2EBE3]">
                      <div>
                        <p className="font-medium text-[#2A2421]">{it.qty}x {it.name}</p>
                        <p className="text-[11px] text-[#70655E]">Format : {it.variant}</p>
                      </div>
                      <span className="font-semibold">{formatPrice(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total final */}
              <div className="pt-2 flex justify-between items-center text-sm font-semibold text-[#2A2421]">
                <span>Total réglé (CB / Stripe)</span>
                <span className="font-serif text-lg">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-4 border-t border-[#F2EBE3] flex gap-3">
              {selectedOrder.status === "pending" && (
                <button
                  onClick={() => markAsShipped(selectedOrder.id)}
                  className="w-full py-3 bg-[#2A2421] hover:bg-[#9C6D49] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Marquer comme Expédiée</span>
                </button>
              )}
              {selectedOrder.status === "shipped" && (
                <div className="w-full py-2.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-xl text-center border border-blue-200">
                  Colis expédié avec succès
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVO PRODUCTO DESDE EL MÓVIL */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#F2EBE3]">
              <div>
                <span className="text-xs text-[#9C6D49] font-bold tracking-wider uppercase">Ajout Rapide</span>
                <h3 className="font-serif text-xl font-medium text-[#2A2421]">Nouveau Produit</h3>
              </div>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="text-[#70655E] hover:text-[#2A2421] p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newProductName || !newProductPrice) return;
                const newProd = {
                  id: `prod-${Date.now()}`,
                  category_id: "cat-1",
                  category_name: newProductCategory,
                  name: newProductName,
                  slug: newProductName.toLowerCase().replace(/\s+/g, "-"),
                  description: "Nouvelle création artisanale disponible en boutique.",
                  scent_notes: newProductNotes ? newProductNotes.split(",").map(s => s.trim()) : ["Notes fraîches"],
                  base_price: parseFloat(newProductPrice),
                  images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800"],
                  is_active: true,
                };
                setProducts([newProd, ...products]);
                setShowNewProductModal(false);
                setNewProductName("");
                setNewProductPrice("");
                setNewProductNotes("");
              }}
              className="py-4 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#2A2421] font-medium mb-1">Nom du produit</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Bougie Fleur de Cerisier"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] focus:border-[#9C6D49] focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2A2421] font-medium mb-1">Catégorie</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8DFD8] focus:border-[#9C6D49] focus:outline-none text-xs bg-white"
                  >
                    <option value="Bougies Parfumées">Bougies Parfumées</option>
                    <option value="Eaux de Parfum">Eaux de Parfum</option>
                    <option value="Diffuseurs & Brumes">Diffuseurs & Brumes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#2A2421] font-medium mb-1">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="24.90"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] focus:border-[#9C6D49] focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2A2421] font-medium mb-1">Notes olfactives (séparées par une virgule)</label>
                <input
                  type="text"
                  placeholder="Ex : Cerisier, Musc doux, Jasmin"
                  value={newProductNotes}
                  onChange={(e) => setNewProductNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] focus:border-[#9C6D49] focus:outline-none text-xs"
                />
              </div>

              {/* Botón de carga de fotos desde el teléfono */}
              <div>
                <label className="block text-[#2A2421] font-medium mb-1">Photo du produit</label>
                <div className="border-2 border-dashed border-[#E8DFD8] rounded-2xl p-4 text-center hover:border-[#9C6D49] cursor-pointer bg-[#FAF8F5]">
                  <p className="text-[11px] text-[#70655E]">
                    📸 Touchez ici pour prendre une photo avec votre téléphone ou choisir dans votre galerie
                  </p>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#2A2421] hover:bg-[#9C6D49] text-white text-xs font-semibold rounded-xl transition"
                >
                  Enregistrer et publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
