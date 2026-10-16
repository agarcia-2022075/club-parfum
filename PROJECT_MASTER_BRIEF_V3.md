# MASTER BRIEF & ARCHITECTURE SPEC: E-COMMERCE "CLUB PARFUM" (FRANCE) — VERSION 3.0 (ACTUALIZADO)

## 1. RESUMEN DEL PROYECTO & IDENTIDAD
* **Nombre de Marca:** Club Parfum (Maison de Senteurs • France)
* **Mercado Objetivo:** Francia Metropolitana exclusivamente.
* **Nicho:** Alta perfumería de interiores, velas aromáticas 100% vegetales, aguas de perfume y difusores de ambiente artesanales elaborados con esencias de Grasse.
* **Filosofía de Negocio:** Coste fijo operativo de 0 €/mes (Hosting, Base de Datos y CDN gratuitos), máxima autonomía para la dueña (no técnica) gestionando pedidos y catálogo desde su smartphone o PC.
* **Estilo Visual & Dirección de Arte:** "Naturel, chaleureux, élégant & haut de gamme" (Inspirado en la alta perfumería francesa, libre de clichés y plantillas genéricas de IA).

---

## 2. REQUISITOS DE NEGOCIO Y LOGÍSTICA EN FRANCIA
* **Modalidades de Envío:**
  1. *Point Relais (Mondial Relay):* 4,50 € (Opción económica preferida en Francia; requiere captura de `relay_point_id` mediante mapa interactivo en checkout).
  2. *Colissimo Domicile (La Poste):* 6,90 € (Formulario adaptado al formato francés: Digicode, interphone, bâtiment, étage y código postal de 5 dígitos).
  3. *Livraison Express (Chronopost / Colissimo Expert):* 11,90 € (Con entrega en 24h-48h y firma).
* **Medios de Pago:**
  - Stripe Checkout: Cartes Bancaires (CB), Apple Pay, Google Pay.
  - PayPal & Wero (estándar bancario europeo para transferencias inmediatas en Francia).
  - Política estricta: Sin pago contra entrega (*Pas de paiement à la livraison*).
* **Atención y Conversión:**
  - Checkout automático en la web.
  - Botón flotante y enlaces directos a WhatsApp en cada producto con mensaje prellenado sobre la fragancia para asesoramiento olfativo personalizado.
* **Marco Legal y Fiscal Francés:**
  - Régimen de Micro-entreprise.
  - Mención fiscal obligatoria en footer y facturación: *"TVA non applicable, art. 293 B du CGI"*.
  - Excepción legal del derecho de desistimiento de 14 días bajo el *Article L221-28 du Code de la consommation* para productos cosméticos o perfumes desprecintados por motivos de higiene.

---

## 3. STACK TÉCNICO & ARQUITECTURA (COSTO FIJO 0 €)
* **Frontend & Framework:** Next.js 16 (App Router, Turbopack, React 19, TypeScript).
* **Estilizado & Tokens:** Tailwind CSS v4 con variables CSS semánticas de lujo.
* **Dirección de Arte y Diseño:** 
  - `taste-skill`: Arquetipo *page-is-the-object*, composición espaciosa, sin etiquetas ni sombras duras artificiales.
  - `ui-ux-pro-max`: Sistema de diseño documentado en `design-system/club-parfum/MASTER.md`.
  - `impeccable`: Criterio *Craft Floor*, objetivos táctiles mínimos de 44×44px para móviles, contraste accesible WCAG > 4.5:1, selección de texto temática (`::selection`) y transiciones suaves con feedback visual.
* **Tipografía:** 
  - Display / Títulos: **Cormorant Garamond** (Google Fonts).
  - Cuerpo / UI: **Montserrat** (Google Fonts).
* **Base de Datos & Auth & Storage:** Supabase (PostgreSQL gratuito, Supabase Auth para la dueña y Supabase Storage para CDN de imágenes).
* **Alojamiento & Despliegue:** Vercel (Hobby / Free Tier).
* **Emails Transaccionales:** Resend (Free Tier hasta 3,000 correos/mes).
* **Automatización Keepalive:** Cron de Vercel pingueando `/api/cron/keepalive` para evitar la pausa de 7 días del Free Tier de Supabase.

---

## 4. MAPA DE RUTAS Y ARQUITECTURA DE LA APLICACIÓN (DESCONGESTIONADA)
A diferencia de una "one-page" saturada, la tienda sigue el patrón de e-commerce de perfumerías líderes (Bath & Body Works / Soy Fetiche):

1. **`\` (Portada / Home):** 
   - Escaparate espacioso y minimalista.
   - Hero impactante con promesa de marca.
   - Bloque de *Savoir-Faire* (Ceras vegetales, esencias de Grasse, coulage artesanal).
   - Sección *"Les Incontournables"* (solo 3 productos destacados con botón de descubrimiento).
   - Bannière informativa de envíos en Francia.
2. **`/boutique` (Catálogo Dedicado):**
   - Catálogo completo con respiración visual.
   - Filtros instantáneos por categoría: *Bougies Parfumées*, *Eaux de Parfum*, *Diffuseurs & Brumes*.
3. **`/produits/[slug]` (Ficha de Producto Individual / PDP):**
   - URL canónica por producto (ej: `/produits/bougie-ambre-precieux-vanille`).
   - Imagen en alta definición con badge de categoría.
   - **Pyramide Olfactive:** Notas aromáticas visibles (cabeza, corazón y fondo).
   - Selector dinámico de formatos y volúmenes (ej: 180g vs 300g, 50ml vs 100ml) que recalcula precio y sku.
   - Control de cantidad y botón *"Ajouter au Panier"* con micro-feedback visual.
   - Botón directo de consulta por WhatsApp sobre esa fragancia específica.
   - Insignias de garantía de entrega y pureza artesanal.
4. **`/livraison` (Página de Envíos & Retornos):**
   - Comparador de las 3 opciones de entrega en Francia.
   - Guía de cómo seleccionar el casillero o comercio en Mondial Relay.
   - Política de devoluciones y normativa europea de higiene.
5. **`/admin` (Panel de Administración Móvil PWA):**
   - Diseñado Mobile-First para la dueña (instalable en la pantalla de inicio del smartphone).
   - Pestaña **Commandes**: Listado de pedidos en tiempo real con estado (*À préparer*, *Expédiée*, *Livrée*), datos del cliente y botón rápido para marcar como enviada.
   - Pestaña **Produits**: Lista de artículos con botón de stock rápido (*En vente / Épuisé*) y modal de creación de producto con carga directa desde la cámara del móvil.

---

## 5. ESQUEMA DE BASE DE DATOS (POSTGRESQL / SUPABASE)
* `categories`: id (uuid), name, slug, description, display_order.
* `products`: id (uuid), category_id (FK), name, slug, description, scent_notes (array), base_price, images (jsonb), is_active (bool), has_variants (bool), created_at.
* `product_variants`: id (uuid), product_id (FK), sku, size_label (ej: "180 g", "50 ml"), price, in_stock (bool), stock_quantity (int).
* `shipping_methods`: id (uuid), code, name, carrier, price, requires_relay_point (bool), estimated_days, is_active.
* `orders`: id (uuid), order_number (unique), customer_name, customer_email, customer_phone, shipping_address (jsonb con digicode, interphone, bâtiment, postal_code 5 dígitos, ville), relay_point_id, relay_point_details, shipping_method_id (FK), shipping_cost, subtotal, total_amount, payment_gateway, payment_status, stripe_payment_intent_id, order_status, tracking_number, notes, created_at.
* `order_items`: id (uuid), order_id (FK), product_id (FK), variant_id (FK, nullable), product_name, variant_label, unit_price, quantity, total_price.
* `admin_profiles`: id (uuid, auth.users), email, full_name, role.

---

## 6. ESTADO ACTUAL DEL REPOSITORIO & PRÓXIMOS PASOS
* **Repositorio GitHub:** `https://github.com/agarcia-2022075/club-parfum` (Rama `main`, commits en español).
* **Estado:** 
  - Frontend completo, descongestionado y multi-página funcionando.
  - Dirección de arte y sistema de diseño implementados y compilados sin errores de TypeScript.
* **Próximos Pasos (Fase Conexión Real / MVP):**
  1. Conectar proyecto real de Supabase (crear tablas mediante script SQL y configurar variables de entorno).
  2. Implementar autenticación segura en `/admin` con Supabase Auth.
  3. Crear el Carrito Global (Zustand o Context API) con Drawer lateral deslizable.
  4. Integrar Stripe Checkout Session para cobros con tarjetas francesas y Apple Pay.
  5. Configurar Resend para emails automáticos de confirmación de pedido.
