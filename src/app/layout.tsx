import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartDrawer } from "@/components/CartDrawer";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://club-parfum.fr"),
  title: {
    default: "Club Parfum | Haute Parfumerie & Bougies Artisanales de Grasse",
    template: "%s | Club Parfum • Maison de Senteurs",
  },
  description:
    "Artisan Parfumeur en France. Découvrez nos eaux de parfum élaborées à Grasse, bougies 100% cire végétale, brumes d'oreiller et diffuseurs d'intérieur. Livraison offerte dès 60 €.",
  keywords: [
    "Club Parfum",
    "Haute Parfumerie",
    "Parfum de Grasse",
    "Bougies artisanales",
    "Cire végétale",
    "Brumes d'oreiller",
    "Diffuseurs d'ambiance",
    "Maison de Senteurs",
    "Artisan Parfumeur France",
    "Grasse",
    "Pyramide olfactive",
  ],
  authors: [{ name: "Club Parfum • Maison de Senteurs" }],
  creator: "Club Parfum",
  publisher: "Club Parfum",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Club Parfum | Haute Parfumerie & Bougies Artisanales de Grasse",
    description:
      "Artisan Parfumeur en France. Découvrez nos eaux de parfum élaborées à Grasse, bougies 100% cire végétale, brumes d'oreiller et diffuseurs d'intérieur. Livraison offerte dès 60 €.",
    url: "https://club-parfum.fr",
    siteName: "Club Parfum • Maison de Senteurs",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FAFAF8] text-[#1C1917] selection:bg-[#A16207] selection:text-white w-full max-w-full overflow-x-hidden">
        <CatalogProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
