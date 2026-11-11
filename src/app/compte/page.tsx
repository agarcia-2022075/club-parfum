"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth, evaluatePasswordStrength, validatePassword } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CustomerOrder } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import {
  User,
  Package,
  MapPin,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Copy,
  ExternalLink,
  MessageCircle,
  Search,
  Sparkles,
  ChevronRight,
  Truck,
  Heart,
} from "lucide-react";

export default function ComptePage() {
  const {
    user,
    isLoading: isAuthLoading,
    lockoutSecondsLeft,
    login,
    register,
    updateProfile,
    updatePassword,
    resetPasswordEmail,
    logout,
  } = useAuth();

  // Mode non-connecté : 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");

  // Mode connecté : 'orders' | 'address' | 'security'
  const [activeTab, setActiveTab] = useState<"orders" | "address" | "security">("orders");

  // --- Formulaire de Connexion ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- Formulaire d'Inscription ---
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRgpd, setRegRgpd] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // --- Formulaire Mot de passe oublié ---
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // --- Carnet d'adresse client (Onglet 2) ---
  const [addressData, setAddressData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    building: "",
    digicode: "",
    postalCode: "75011",
    city: "Paris",
    favoriteFamily: "Orientale",
  });
  const [addressSuccess, setAddressSuccess] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // --- Sécurité & Changement Mot de passe (Onglet 3) ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- Commandes du client (Onglet 1) ---
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // --- Suivi de commande sans compte (Guest Tracker) ---
  const [guestOrderNum, setGuestOrderNum] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestOrderResult, setGuestOrderResult] = useState<CustomerOrder | null>(null);
  const [guestOrderError, setGuestOrderError] = useState<string | null>(null);
  const [isSearchingGuestOrder, setIsSearchingGuestOrder] = useState(false);

  // Synchroniser les champs d'adresse lorsque l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setAddressData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        address: user.address || "",
        building: user.building || "",
        digicode: user.digicode || "",
        postalCode: user.postalCode || "75011",
        city: user.city || "Paris",
        favoriteFamily: user.favoriteFamily || "Orientale",
      });
    }
  }, [user]);

  // Charger l'historique des commandes du client connecté
  useEffect(() => {
    if (!user) {
      setCustomerOrders([]);
      return;
    }

    let isMounted = true;
    async function fetchOrders() {
      setIsLoadingOrders(true);
      if (isSupabaseConfigured && supabase) {
        try {
          const userEmail = user?.email.trim().toLowerCase();
          const isValidUuid = Boolean(
            user?.id &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
          );

          let queryData: any[] | null = null;
          let queryError: any = null;

          // 1. Si user.id est un UUID valide, tenter la recherche combinée email + user_id
          if (isValidUuid && user?.id) {
            const res = await supabase
              .from("orders")
              .select("*")
              .or(`customer_email.ilike.${userEmail},user_id.eq.${user.id}`)
              .order("created_at", { ascending: false });

            queryData = res.data;
            queryError = res.error;
          }

          // 2. Fallback automatique si la colonne user_id n'existe pas en base, si erreur SQL ou si user.id n'est pas un UUID (ex. compte local 'usr-...')
          if (!queryData || queryError || !isValidUuid) {
            const fallbackRes = await supabase
              .from("orders")
              .select("*")
              .ilike("customer_email", userEmail || "")
              .order("created_at", { ascending: false });

            queryData = fallbackRes.data;
            queryError = fallbackRes.error;
          }

          if (!queryError && queryData && isMounted) {
            setCustomerOrders(
              queryData.map((o: any) => ({
                id: o.id,
                order_number: o.order_number,
                date: o.date,
                customer_first_name: o.customer_first_name,
                customer_last_name: o.customer_last_name,
                customer_name: o.customer_name,
                customer_email: o.customer_email,
                customer_phone: o.customer_phone,
                shipping_method_id: o.shipping_method_id,
                shipping_method: o.shipping_method,
                shipping_cost: Number(o.shipping_cost || 0),
                relay_point: o.relay_point,
                address: o.address,
                building: o.building,
                digicode: o.digicode,
                postal_code: o.postal_code,
                city: o.city,
                subtotal: Number(o.subtotal || 0),
                total: Number(o.total || 0),
                status: o.status || "pending",
                tracking: o.tracking || "",
                items: Array.isArray(o.items) ? o.items : [],
                created_at: o.created_at,
                user_id: o.user_id,
              }))
            );
          }
        } catch (err) {
          console.warn("Erreur chargement commandes client:", err);
        }
      }
      if (isMounted) setIsLoadingOrders(false);
    }

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handler Connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const res = await login(loginEmail, loginPassword);
    setIsLoggingIn(false);

    if (!res.success) {
      setLoginError(res.error || "Identifiants invalides.");
    }
  };

  // Handler Inscription
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setRegError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (!regRgpd) {
      setRegError("Veuillez accepter la politique de confidentialité pour créer votre compte.");
      return;
    }

    setIsRegistering(true);
    const res = await register({
      email: regEmail,
      password: regPassword,
      firstName: regFirstName,
      lastName: regLastName,
      phone: regPhone,
    });
    setIsRegistering(false);

    if (!res.success) {
      setRegError(res.error || "Impossible de créer votre compte.");
    } else if (res.needsEmailConfirmation) {
      setRegSuccess(
        "Votre compte a été pré-enregistré. Un e-mail de confirmation vous a été envoyé pour sécuriser votre adresse."
      );
    }
  };

  // Handler Mot de passe oublié
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);
    setIsForgotLoading(true);

    const res = await resetPasswordEmail(forgotEmail);
    setIsForgotLoading(false);

    if (!res.success) {
      setForgotError(res.error || "Erreur lors de l'envoi de l'e-mail.");
    } else {
      setForgotMessage(
        "Un lien de réinitialisation sécurisé a été expédié à votre adresse si elle correspond à un compte actif."
      );
    }
  };

  // Handler Sauvegarde Adresse
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSuccess(null);
    setIsSavingAddress(true);

    const res = await updateProfile(addressData);
    setIsSavingAddress(false);

    if (res.success) {
      setAddressSuccess("Vos coordonnées et préférences olfactives ont été enregistrées avec succès.");
      setTimeout(() => setAddressSuccess(null), 4000);
    }
  };

  // Handler Changement de mot de passe
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    const check = validatePassword(newPassword);
    if (!check.valid) {
      setPasswordError(check.message || "Mot de passe insuffisant.");
      return;
    }

    setIsChangingPassword(true);
    const res = await updatePassword(newPassword);
    setIsChangingPassword(false);

    if (!res.success) {
      setPasswordError(res.error || "Impossible de mettre à jour le mot de passe.");
    } else {
      setPasswordSuccess("Votre mot de passe a été modifié avec succès.");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPasswordSuccess(null), 4000);
    }
  };

  // Handler Recherche Commande Invité
  const handleSearchGuestOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestOrderError(null);
    setGuestOrderResult(null);

    const num = guestOrderNum.trim();
    const mail = guestEmail.trim().toLowerCase();

    if (!num || !mail) {
      setGuestOrderError("Veuillez renseigner le numéro de commande et l'adresse e-mail.");
      return;
    }

    setIsSearchingGuestOrder(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .ilike("order_number", num)
          .ilike("customer_email", mail)
          .maybeSingle();

        if (error || !data) {
          setGuestOrderError("Aucune commande ne correspond à ce numéro et à cette adresse e-mail.");
        } else {
          setGuestOrderResult({
            id: data.id,
            order_number: data.order_number,
            date: data.date,
            customer_first_name: data.customer_first_name,
            customer_last_name: data.customer_last_name,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            shipping_method_id: data.shipping_method_id,
            shipping_method: data.shipping_method,
            shipping_cost: Number(data.shipping_cost || 0),
            relay_point: data.relay_point,
            address: data.address,
            building: data.building,
            digicode: data.digicode,
            postal_code: data.postal_code,
            city: data.city,
            subtotal: Number(data.subtotal || 0),
            total: Number(data.total || 0),
            status: data.status || "pending",
            tracking: data.tracking || "",
            items: Array.isArray(data.items) ? data.items : [],
            created_at: data.created_at,
          });
        }
      } catch {
        setGuestOrderError("Erreur réseau lors de la recherche de votre commande.");
      }
    } else {
      setGuestOrderError("Le serveur de suivi est temporairement indisponible.");
    }
    setIsSearchingGuestOrder(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const regStrength = evaluatePasswordStrength(regPassword);
  const newStrength = evaluatePasswordStrength(newPassword);

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "shipped":
        return {
          label: "Expédiée — En acheminement",
          className: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "delivered":
        return {
          label: "Livrée",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "cancelled":
        return {
          label: "Annulée",
          className: "bg-rose-50 text-rose-800 border-rose-200",
        };
      case "pending":
      default:
        return {
          label: "À préparer en atelier à Grasse",
          className: "bg-amber-50 text-amber-900 border-amber-200",
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" className="mb-8">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-[#78716C]">
            <li>
              <Link href="/" className="hover:text-[#1C1917] transition-colors">
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">•</li>
            <li className="text-[#1C1917] font-medium">Mon Compte</li>
          </ol>
        </nav>

        {/* ========================================================================= */}
        {/* ÉCRAN DE CHARGEMENT PRÉLIMINAIRE                                          */}
        {/* ========================================================================= */}
        {isAuthLoading ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto min-h-[640px] flex flex-col justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#A16207] mx-auto" />
            <p className="text-sm text-[#57534E]">Chargement sécurisé de votre Espace Membre...</p>
          </div>
        ) : !user ? (
          /* ========================================================================= */
          /* VISTA 1 : CLIENT NON CONNECTÉ (CONNEXION / INSCRIPTION / GUEST TRACKER)   */
          /* ========================================================================= */
          <div className="space-y-12">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-[0.28em] text-[#A16207] font-semibold block mb-2">
                Haute Parfumerie & Bougies Végétales
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
                Espace Membre Privilège
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#57534E] leading-relaxed font-light">
                Connectez-vous pour suivre vos expéditions de Grasse en temps réel, commander en 1 clic et mémoriser votre profil olfactif.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-start">
              {/* COLONNE GAUCHE (7 cols) : FORMULAIRE AUTHENTIFICATION */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E2DA] shadow-xs p-6 sm:p-8">
                {/* Mode Mot de Passe Oublié */}
                {authMode === "forgot" ? (
                  <div className="space-y-6">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setForgotError(null);
                        setForgotMessage(null);
                      }}
                      className="text-xs text-[#A16207] hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
                    >
                      ← Retour à la connexion
                    </button>

                    <div>
                      <h2 className="font-serif text-2xl text-[#1C1917]">Mot de passe oublié</h2>
                      <p className="text-xs sm:text-sm text-[#57534E] mt-1 leading-relaxed">
                        Renseignez votre adresse e-mail. Nous vous expédierons un lien chiffré pour réinitialiser votre mot de passe.
                      </p>
                    </div>

                    {forgotError && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    {forgotMessage && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{forgotMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                          Adresse e-mail *
                        </label>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="marie.dupont@gmail.com"
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isForgotLoading}
                        className="w-full py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {isForgotLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <span>Envoyer le lien de réinitialisation</span>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <h2 className="sr-only">
                      {authMode === "login"
                        ? "Connexion à votre espace client"
                        : "Créer votre compte client"}
                    </h2>

                    {/* Sélecteur d'onglets Connexion / Inscription */}
                    <div className="flex border-b border-[#E7E2DA] mb-8">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setLoginError(null);
                        }}
                        className={`flex-1 pb-3 text-sm sm:text-base font-semibold tracking-wider uppercase transition-colors relative cursor-pointer ${
                          authMode === "login"
                            ? "text-[#1C1917] border-b-2 border-[#A16207]"
                            : "text-[#78716C] hover:text-[#1C1917]"
                        }`}
                      >
                        Se Connecter
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("register");
                          setRegError(null);
                          setRegSuccess(null);
                        }}
                        className={`flex-1 pb-3 text-sm sm:text-base font-semibold tracking-wider uppercase transition-colors relative cursor-pointer ${
                          authMode === "register"
                            ? "text-[#1C1917] border-b-2 border-[#A16207]"
                            : "text-[#78716C] hover:text-[#1C1917]"
                        }`}
                      >
                        Créer un Compte
                      </button>
                    </div>

                    {/* ALERTE DE RATE LIMITING (ANTI-FUERZA BRUTA) */}
                    {lockoutSecondsLeft > 0 && (
                      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                        <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Sécurité : Connexion temporairement bloquée</p>
                          <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
                            Pour prévenir toute tentative d&apos;accès frauduleux, veuillez patienter{" "}
                            <strong>{lockoutSecondsLeft} secondes</strong> avant votre prochain essai.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* --- CONTENU ONGLET 1 : CONNEXION --- */}
                    {authMode === "login" && (
                      <form onSubmit={handleLogin} className="space-y-5">
                        {loginError && (
                          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{loginError}</span>
                          </div>
                        )}

                        <div>
                          <label htmlFor="login-email" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                            Adresse e-mail *
                          </label>
                          <div className="relative">
                            <input
                              id="login-email"
                              type="email"
                              required
                              autoComplete="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="marie.dupont@gmail.com"
                              className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917] pl-10"
                            />
                            <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3.5" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="login-password" className="block text-sm font-medium text-[#1C1917]">
                              Mot de passe *
                            </label>
                            <button
                              type="button"
                              onClick={() => setAuthMode("forgot")}
                              className="text-xs text-[#A16207] hover:underline cursor-pointer"
                            >
                              Mot de passe oublié ?
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              id="login-password"
                              type={showLoginPassword ? "text" : "password"}
                              required
                              autoComplete="current-password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917] pl-10 pr-12"
                            />
                            <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3.5" />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-1 top-1 bottom-1 w-11 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] cursor-pointer rounded-r-lg"
                              aria-label={showLoginPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                              {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoggingIn || lockoutSecondsLeft > 0}
                          className="w-full py-4 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {isLoggingIn ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Authentification en cours...</span>
                            </>
                          ) : (
                            <span>Accéder à mon Espace Membre</span>
                          )}
                        </button>
                      </form>
                    )}

                    {/* --- CONTENU ONGLET 2 : CRÉER UN COMPTE --- */}
                    {authMode === "register" && (
                      <form onSubmit={handleRegister} className="space-y-4">
                        {regError && (
                          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{regError}</span>
                          </div>
                        )}

                        {regSuccess && (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{regSuccess}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="reg-firstname" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                              Prénom *
                            </label>
                            <input
                              id="reg-firstname"
                              type="text"
                              required
                              value={regFirstName}
                              onChange={(e) => setRegFirstName(e.target.value)}
                              placeholder="Marie"
                              className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                            />
                          </div>
                          <div>
                            <label htmlFor="reg-lastname" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                              Nom *
                            </label>
                            <input
                              id="reg-lastname"
                              type="text"
                              required
                              value={regLastName}
                              onChange={(e) => setRegLastName(e.target.value)}
                              placeholder="Dupont"
                              className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="reg-email" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                              Adresse e-mail *
                            </label>
                            <input
                              id="reg-email"
                              type="email"
                              required
                              autoComplete="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="marie.dupont@gmail.com"
                              className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                            />
                          </div>
                          <div>
                            <label htmlFor="reg-phone" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                              Téléphone mobile *
                            </label>
                            <input
                              id="reg-phone"
                              type="tel"
                              required
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="06 12 34 56 78"
                              className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="reg-password" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                            Mot de passe (8 car. min, lettres & chiffres) *
                          </label>
                          <div className="relative">
                            <input
                              id="reg-password"
                              type={showRegPassword ? "text" : "password"}
                              required
                              autoComplete="new-password"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917] pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-1 top-1 bottom-1 w-11 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] cursor-pointer rounded-r-lg"
                              aria-label={showRegPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Medidor visual de seguridad */}
                          {regPassword.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#78716C]">Sécurité du mot de passe :</span>
                                <span className="font-semibold text-[#1C1917]">{regStrength.label}</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                                {[1, 2, 3, 4].map((step) => (
                                  <div
                                    key={step}
                                    className={`rounded-full transition-all duration-300 ${
                                      regStrength.score >= step ? regStrength.colorClass : "bg-neutral-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                            Confirmer le mot de passe *
                          </label>
                          <input
                            id="reg-confirm-password"
                            type={showRegPassword ? "text" : "password"}
                            required
                            autoComplete="new-password"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                          />
                        </div>

                        <div className="pt-2">
                          <label className="flex items-start gap-2.5 text-xs text-[#57534E] leading-relaxed cursor-pointer">
                            <input
                              type="checkbox"
                              checked={regRgpd}
                              onChange={(e) => setRegRgpd(e.target.checked)}
                              className="mt-0.5 rounded border-[#E7E2DA] text-[#A16207] focus:ring-[#A16207]"
                            />
                            <span>
                              J&apos;accepte la{" "}
                              <Link href="/politique-confidentialite" className="text-[#A16207] underline">
                                Politique de Confidentialité
                              </Link>{" "}
                              de Club Parfum. Mes données sont traitées de manière chiffrée et exclusive pour le suivi de mes commandes.
                            </span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={isRegistering}
                          className="w-full py-4 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-4"
                        >
                          {isRegistering ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Création du compte...</span>
                            </>
                          ) : (
                            <span>Créer mon Compte Privilège</span>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* COLONNE DROITE (5 cols) : PRIVILÈGES DU CLUB & SUIVI COMMANDE SANS COMPTE */}
              <div className="lg:col-span-5 space-y-8">
                {/* BLOC 1 : PRIVILÈGES DU CLUB PARFUM */}
                <div className="p-6 sm:p-7 rounded-2xl bg-[#EDE8DF]/70 border border-[#E7E2DA] space-y-5">
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917]">
                    Les Privilèges de votre Compte Maison
                  </h2>

                  <ul className="space-y-4 text-xs sm:text-sm text-[#44403C]">
                    <li className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white text-[#A16207] shadow-2xs shrink-0 mt-0.5">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-[#1C1917] block">Suivi de Colis en Temps Réel</strong>
                        <span className="text-[#57534E] leading-relaxed">
                          Consultez l&apos;état d&apos;avancement à Grasse et votre numéro de suivi Mondial Relay ou Colissimo.
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white text-[#A16207] shadow-2xs shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-[#1C1917] block">Commande Rapide en 1 Clic</strong>
                        <span className="text-[#57534E] leading-relaxed">
                          Mémorisez votre adresse, code postal et digicode pour ne plus jamais avoir à les ressaisir.
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white text-[#A16207] shadow-2xs shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-[#1C1917] block">Harmonies Olfactives Personnalisées</strong>
                        <span className="text-[#57534E] leading-relaxed">
                          Accédez à des recommandations sur-mesure fondées sur vos familles olfactives favorites.
                        </span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white text-[#A16207] shadow-2xs shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-[#1C1917] block">Sécurité & Chiffrement RGPD</strong>
                        <span className="text-[#57534E] leading-relaxed">
                          Authentification chiffrée SSL/TLS et politiques de sécurité Row Level Security (RLS).
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* BLOC 2 : SUIVRE UNE COMMANDE SANS COMPTE (GUEST ORDER TRACKER) */}
                <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E7E2DA] shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#A16207] font-semibold">
                    <Search className="w-4 h-4" />
                    <span>Accès Rapide Invité</span>
                  </div>
                  <h2 className="font-serif text-xl text-[#1C1917]">Suivre une commande sans compte</h2>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    Vous avez passé commande en tant qu&apos;invité(e) ? Saisissez votre numéro de commande et votre e-mail pour consulter le statut de préparation :
                  </p>

                  <form onSubmit={handleSearchGuestOrder} className="space-y-3 pt-1">
                    <div>
                      <label htmlFor="guest-order-num" className="sr-only">
                        Numéro de commande
                      </label>
                      <input
                        id="guest-order-num"
                        type="text"
                        required
                        value={guestOrderNum}
                        onChange={(e) => setGuestOrderNum(e.target.value)}
                        placeholder="N° de commande (ex : CP-2026-4821)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <label htmlFor="guest-order-email" className="sr-only">
                        Adresse e-mail
                      </label>
                      <input
                        id="guest-order-email"
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Adresse e-mail utilisée lors de l'achat"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs text-[#1C1917]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSearchingGuestOrder}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#F2EFE9] hover:bg-[#1C1917] hover:text-white text-[#1C1917] text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSearchingGuestOrder ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>Rechercher mon colis</span>
                    </button>
                  </form>

                  {guestOrderError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {guestOrderError}
                    </div>
                  )}

                  {/* Résultat du suivi invité */}
                  {guestOrderResult && (
                    <div className="mt-4 p-4 rounded-xl bg-[#F5F2EB] border border-[#E7E2DA] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#1C1917]">
                          #{guestOrderResult.order_number}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            formatStatus(guestOrderResult.status).className
                          }`}
                        >
                          {formatStatus(guestOrderResult.status).label}
                        </span>
                      </div>

                      <p className="text-xs text-[#57534E]">
                        Date : <strong className="text-[#1C1917]">{guestOrderResult.date}</strong> • Total :{" "}
                        <strong className="text-[#A16207]">{formatPrice(guestOrderResult.total)}</strong>
                      </p>

                      {guestOrderResult.tracking ? (
                        <div className="p-3 bg-white rounded-lg border border-[#E7E2DA] space-y-2">
                          <p className="text-[11px] font-medium text-[#78716C] uppercase">Numéro de suivi Colissimo / Relay :</p>
                          <div className="flex items-center justify-between">
                            <code className="text-xs font-bold text-[#A16207] font-mono">{guestOrderResult.tracking}</code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(guestOrderResult.tracking || "", "guest")}
                              className="text-xs text-[#1C1917] hover:text-[#A16207] flex items-center gap-1 cursor-pointer font-medium"
                            >
                              {copiedOrderId === "guest" ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copié</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copier</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#78716C] italic">
                          Colis en cours de préparation dans notre atelier de Grasse. Le numéro de suivi sera actif dès la prise en charge par le transporteur.
                        </p>
                      )}

                      <a
                        href={`https://wa.me/33769914251?text=${encodeURIComponent(
                          `Bonjour Club Parfum, je souhaite un renseignement sur l'acheminement de ma commande #${guestOrderResult.order_number}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-[#E7E2DA] hover:bg-[#FAF8F5] text-xs font-medium text-[#1C1917] transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#A16207]" />
                        <span>Contacter l&apos;atelier sur WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VISTA 2 : CLIENT CONNECTÉ (ESPACE MEMBRE COMPLET AVEC 3 ONGLETS)          */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* Header de Bienvenue */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E2DA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-[#F2EFE9] text-[#A16207] rounded-full border border-[#E7E2DA]">
                    Membre Privilège • Grasse
                  </span>
                  <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Session Sécurisée</span>
                  </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal">
                  Bonjour, {user.firstName} {user.lastName}
                </h1>
                <p className="text-xs sm:text-sm text-[#78716C]">
                  Compte associé à : <strong className="text-[#1C1917] font-medium">{user.email}</strong>
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7E2DA] hover:bg-[#F2EFE9] text-xs sm:text-sm font-medium text-[#1C1917] transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#78716C]" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>

            {/* Barre de navigation des 3 onglets */}
            <div className="flex items-center gap-2 border-b border-[#E7E2DA] pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
                  activeTab === "orders"
                    ? "bg-[#1C1917] text-white shadow-xs"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Mes Commandes & Suivi ({customerOrders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("address")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
                  activeTab === "address"
                    ? "bg-[#1C1917] text-white shadow-xs"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Carnet d&apos;Adresse & 1-Clic</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
                  activeTab === "security"
                    ? "bg-[#1C1917] text-white shadow-xs"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sécurité & Mot de Passe</span>
              </button>
            </div>

            {/* ===================================================================== */}
            {/* ONGLET 1 : MES COMMANDES & SUIVI                                      */}
            {/* ===================================================================== */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {isLoadingOrders ? (
                  <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#E7E2DA]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#A16207] mx-auto" />
                    <p className="text-xs text-[#57534E]">Récupération de vos commandes en cours...</p>
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-4 bg-white rounded-2xl border border-[#E7E2DA] p-6 max-w-xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-[#F2EFE9] text-[#A16207] flex items-center justify-center mx-auto">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-2xl text-[#1C1917]">Aucune commande pour le moment</h3>
                    <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-md mx-auto font-light">
                      Vous n&apos;avez pas encore passé de commande avec cette adresse e-mail. Vos créations artisanales s&apos;afficheront ici avec leur numéro de suivi dès validation.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/boutique"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-wider transition"
                      >
                        <span>Explorer la boutique</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {customerOrders.map((order) => {
                      const statusInfo = formatStatus(order.status);
                      const whatsappText = `Bonjour Club Parfum, je souhaite des précisions concernant ma commande #${order.order_number} (${order.status}).`;
                      const whatsappUrl = `https://wa.me/33769914251?text=${encodeURIComponent(whatsappText)}`;

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border border-[#E7E2DA] shadow-xs overflow-hidden transition-all duration-200 hover:border-[#1C1917]/30"
                        >
                          {/* En-tête commande */}
                          <div className="p-5 sm:p-6 bg-[#FAFAF8] border-b border-[#E7E2DA] flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-serif text-xl sm:text-2xl text-[#1C1917] font-semibold">
                                  #{order.order_number}
                                </span>
                                <span
                                  className={`text-xs font-semibold uppercase px-3 py-1 rounded-full border ${statusInfo.className}`}
                                >
                                  {statusInfo.label}
                                </span>
                              </div>
                              <p className="text-xs text-[#78716C]">
                                Date de commande : <strong className="text-[#1C1917]">{order.date}</strong> • Mode :{" "}
                                <strong className="text-[#1C1917]">{order.shipping_method}</strong>
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs uppercase tracking-wider text-[#78716C] block">Total réglé</span>
                              <span className="font-serif text-2xl text-[#A16207] font-bold">
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>

                          {/* Corps commande : suivi & articles */}
                          <div className="p-5 sm:p-6 space-y-6">
                            {/* Bloc Suivi Transporteur si tracking renseigné */}
                            {order.tracking ? (
                              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-blue-700" />
                                    <span>Numéro de Suivi Colissimo / Mondial Relay :</span>
                                  </span>
                                  <code className="text-sm sm:text-base font-mono font-bold text-blue-950 block">
                                    {order.tracking}
                                  </code>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(order.tracking || "", order.id)}
                                    className="px-3.5 py-2 rounded-lg bg-white border border-blue-300 hover:bg-blue-100 text-xs font-semibold text-blue-900 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    {copiedOrderId === order.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">Numéro copié</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copier</span>
                                      </>
                                    )}
                                  </button>

                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-2 rounded-lg bg-white border border-blue-300 hover:bg-blue-100 text-xs font-semibold text-blue-900 transition flex items-center gap-1.5 shadow-2xs"
                                    title="Assistance WhatsApp sur cette expédition"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 text-[#A16207]" />
                                    <span className="hidden sm:inline">Assistance</span>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 rounded-xl bg-[#F5F2EB] border border-[#E7E2DA] flex items-center justify-between text-xs text-[#57534E]">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-[#A16207]" />
                                  <span>
                                    Colis en cours de préparation artisanale dans nos ateliers à Grasse. Le numéro de suivi sera actif dès la remise au transporteur.
                                  </span>
                                </div>
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#A16207] hover:underline font-semibold shrink-0 ml-4 hidden sm:inline"
                                >
                                  Poser une question →
                                </a>
                              </div>
                            )}

                            {/* Liste des articles */}
                            <div className="border-t border-[#E7E2DA] pt-4">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-3">
                                Créations incluses dans ce colis :
                              </h4>
                              <div className="divide-y divide-[#E7E2DA]">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                                    <div>
                                      <span className="font-semibold text-[#1C1917]">{item.name}</span>
                                      <span className="text-[#78716C] block sm:inline sm:ml-2 font-light">
                                        ({item.variant}) × {item.qty}
                                      </span>
                                    </div>
                                    <span className="font-medium text-[#1C1917]">
                                      {formatPrice(item.price * item.qty)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Lieu de livraison */}
                            <div className="border-t border-[#E7E2DA] pt-3 text-xs text-[#78716C] flex flex-wrap items-center justify-between gap-2">
                              <span>
                                {order.relay_point ? (
                                  <>
                                    <strong>Point Relais :</strong> {order.relay_point}
                                  </>
                                ) : (
                                  <>
                                    <strong>Livraison à domicile :</strong> {order.address}, {order.postal_code}{" "}
                                    {order.city}
                                  </>
                                )}
                              </span>
                              <span>Frais de port : {order.shipping_cost === 0 ? "Offerts" : formatPrice(order.shipping_cost)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================== */}
            {/* ONGLET 2 : CARNET D'ADRESSE & LIVRAISON 1-CLIC                        */}
            {/* ===================================================================== */}
            {activeTab === "address" && (
              <div className="bg-white rounded-2xl border border-[#E7E2DA] shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
                <div>
                  <h2 className="font-serif text-2xl text-[#1C1917]">Carnet d&apos;Adresse & Livraison 1-Clic</h2>
                  <p className="text-xs sm:text-sm text-[#57534E] mt-1 leading-relaxed">
                    Ces coordonnées seront automatiquement injectées lors de vos passages en caisse pour vous faire gagner un temps précieux.
                  </p>
                </div>

                {addressSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{addressSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1C1917] mb-1.5">Prénom *</label>
                      <input
                        type="text"
                        required
                        value={addressData.firstName}
                        onChange={(e) => setAddressData({ ...addressData, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1C1917] mb-1.5">Nom *</label>
                      <input
                        type="text"
                        required
                        value={addressData.lastName}
                        onChange={(e) => setAddressData({ ...addressData, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                      Téléphone mobile français (pour le livreur) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressData.phone}
                      onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                      Adresse de livraison (Numéro et nom de rue)
                    </label>
                    <input
                      type="text"
                      value={addressData.address}
                      onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                      placeholder="14 Rue des Fleurs"
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                        Bâtiment / Étage (Optionnel)
                      </label>
                      <input
                        type="text"
                        value={addressData.building}
                        onChange={(e) => setAddressData({ ...addressData, building: e.target.value })}
                        placeholder="Bâtiment B, 3ème étage"
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                        Digicode / Interphone (Optionnel)
                      </label>
                      <input
                        type="text"
                        value={addressData.digicode}
                        onChange={(e) => setAddressData({ ...addressData, digicode: e.target.value })}
                        placeholder="Code A1234, sonner Dupont"
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1C1917] mb-1.5">Code Postal (5 chiffres) *</label>
                      <input
                        type="text"
                        required
                        value={addressData.postalCode}
                        onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                        placeholder="75011"
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1C1917] mb-1.5">Ville *</label>
                      <input
                        type="text"
                        required
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        placeholder="Paris"
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>
                  </div>

                  {/* Préférence olfactive */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                      Famille Olfactive Préférée (Pour vos échantillons personnalisés)
                    </label>
                    <select
                      value={addressData.favoriteFamily}
                      onChange={(e) => setAddressData({ ...addressData, favoriteFamily: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917] bg-white"
                    >
                      <option value="Orientale">Orientale (Ambre, vanille, épices chaudes)</option>
                      <option value="Boisée">Boisée (Cèdre de l&apos;Atlas, santal, sauge)</option>
                      <option value="Fleurie">Fleurie (Fleur d&apos;oranger, rose de Grasse, néroli)</option>
                      <option value="Gourmande">Gourmande (Fève tonka, cerise noire, amande)</option>
                      <option value="Poudrée">Poudrée (Fleur de coton, iris, muscs blancs)</option>
                      <option value="Hespéridée">Hespéridée (Bergamote, mandarine, petit grain)</option>
                      <option value="Aromatique">Aromatique (Lavande, romarin, cardamome)</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="py-3.5 px-8 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isSavingAddress ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <span>Enregistrer mon carnet d&apos;adresses</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ===================================================================== */}
            {/* ONGLET 3 : SÉCURITÉ & MOT DE PASSE                                    */}
            {/* ===================================================================== */}
            {activeTab === "security" && (
              <div className="space-y-8 max-w-3xl">
                {/* Informations de Sécurité Active */}
                <div className="p-6 rounded-2xl bg-white border border-[#E7E2DA] shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-[#1C1917]">Protection des Données & Chiffrement</h3>
                      <p className="text-xs text-[#78716C]">Conforme RGPD & Recommandations ANSSI</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
                    Votre compte est protégé par chiffrement SSL/TLS 256-bit et hébergé en conformité avec les réglementations européennes. Vos mots de passe ne sont jamais stockés en clair.
                  </p>
                </div>

                {/* Formulaire de Modification du Mot de passe */}
                <div className="bg-white rounded-2xl border border-[#E7E2DA] shadow-xs p-6 sm:p-8 space-y-5">
                  <h3 className="font-serif text-xl text-[#1C1917]">Modifier mon mot de passe</h3>

                  {passwordError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label htmlFor="new-password-input" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                        Nouveau mot de passe (8 car. min, lettres & chiffres) *
                      </label>
                      <div className="relative">
                        <input
                          id="new-password-input"
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917] pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-1 top-1 bottom-1 w-11 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] cursor-pointer rounded-r-lg"
                          aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {newPassword.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#78716C]">Robustesse :</span>
                            <span className="font-semibold text-[#1C1917]">{newStrength.label}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 h-1.5">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`rounded-full transition-all duration-300 ${
                                  newStrength.score >= step ? newStrength.colorClass : "bg-neutral-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirm-new-password-input" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                        Confirmer le nouveau mot de passe *
                      </label>
                      <input
                        id="confirm-new-password-input"
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="py-3.5 px-8 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mise à jour...</span>
                        </>
                      ) : (
                        <span>Mettre à jour mon mot de passe</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
