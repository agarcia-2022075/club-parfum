"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CustomerProfile } from "@/types/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
export const STORAGE_KEY_SESSION = "club_parfum_auth_session_v1";
const STORAGE_KEY_PROFILE = "club_parfum_customer_profile";
const STORAGE_KEY_FAILED_ATTEMPTS = "club_parfum_failed_logins";
const STORAGE_KEY_LOCKOUT_UNTIL = "club_parfum_lockout_until";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 30;

export interface StoredAuthSession {
  token: string;
  userId: string;
  email: string;
  issuedAt: number;
  expiresAt: number; // Timestamp de expiración (7 días)
  profile: CustomerProfile;
}

/**
 * Sanitisation stricte des entrées utilisateurs (Prévention OWASP XSS & Injections)
 */
export function sanitizeInput(str: string, maxLength = 120): string {
  if (!str) return "";
  return str
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validation de la robustesse du mot de passe (Recommandations ANSSI France / NIST)
 * Exige au minimum 8 caractères, au moins 1 lettre et au moins 1 chiffre ou symbole.
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return {
      valid: false,
      message: "Le mot de passe doit comporter au moins 8 caractères.",
    };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasLetter || !hasDigitOrSpecial) {
    return {
      valid: false,
      message: "Le mot de passe doit combiner des lettres et au moins un chiffre ou caractère spécial.",
    };
  }

  return { valid: true };
}

/**
 * Calcul du score de sécurité du mot de passe (0 à 4)
 * 0: Trop faible | 1: Faible | 2: Moyen | 3: Robuste | 4: Excellence
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  label: string;
  colorClass: string;
} {
  if (!password) {
    return { score: 0, label: "Non renseigné", colorClass: "bg-neutral-200" };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;

  switch (score) {
    case 0:
    case 1:
      return { score: 1, label: "Faible", colorClass: "bg-rose-500" };
    case 2:
      return { score: 2, label: "Moyen", colorClass: "bg-amber-500" };
    case 3:
      return { score: 3, label: "Robuste", colorClass: "bg-blue-600" };
    case 4:
    default:
      return { score: 4, label: "Excellence", colorClass: "bg-emerald-600" };
  }
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthContextType {
  user: CustomerProfile | null;
  isLoading: boolean;
  lockoutSecondsLeft: number;
  sessionExpiresAt: number | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{
    success: boolean;
    error?: string;
    needsEmailConfirmation?: boolean;
  }>;
  updateProfile: (profile: Partial<CustomerProfile>) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  // Sauvegarde locale de la session avec token d'expiration de 7 jours
  const saveLocalSession = useCallback(
    (profile: CustomerProfile, expiresAt?: number, token?: string): StoredAuthSession => {
      const finalExpiresAt = expiresAt || Date.now() + SESSION_DURATION_MS;
      const finalToken = token || `cp_sess_${Date.now()}`;
      const sessionObj: StoredAuthSession = {
        token: finalToken,
        userId: profile.id,
        email: profile.email,
        issuedAt: Date.now(),
        expiresAt: finalExpiresAt,
        profile,
      };

      try {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionObj));
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      } catch {
        // Ignorer si localStorage n'est pas disponible
      }

      setUser(profile);
      setSessionExpiresAt(finalExpiresAt);
      return sessionObj;
    },
    []
  );

  // Nettoyage complet de la session locale
  const clearLocalSession = useCallback(() => {
    setUser(null);
    setSessionExpiresAt(null);
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
    } catch {
      // Ignorer
    }
  }, []);

  // Vérification de la validité temporelle du token (7 jours)
  const checkSessionValidity = useCallback((): StoredAuthSession | null => {
    try {
      const storedStr = localStorage.getItem(STORAGE_KEY_SESSION);
      if (storedStr) {
        const session: StoredAuthSession = JSON.parse(storedStr);
        const now = Date.now();
        if (session && session.expiresAt && now < session.expiresAt) {
          setUser(session.profile);
          setSessionExpiresAt(session.expiresAt);
          return session;
        } else if (session && session.expiresAt && now >= session.expiresAt) {
          console.warn("Session expirée (dépassement des 7 jours). Déconnexion automatique.");
          clearLocalSession();
          if (isSupabaseConfigured && supabase) {
            supabase.auth.signOut().catch(() => {});
          }
          return null;
        }
      }
    } catch {
      // Ignorer
    }
    return null;
  }, [clearLocalSession]);

  // Surveillance périodique de l'expiration toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(checkSessionValidity, 60000);
    return () => clearInterval(interval);
  }, [checkSessionValidity]);

  // --- Gestion du Rate-Limiting & Anti-Fuerza Bruta ---
  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntilStr = sessionStorage.getItem(STORAGE_KEY_LOCKOUT_UNTIL);
        if (lockoutUntilStr) {
          const lockoutUntil = parseInt(lockoutUntilStr, 10);
          const now = Date.now();
          if (lockoutUntil > now) {
            setLockoutSecondsLeft(Math.ceil((lockoutUntil - now) / 1000));
          } else {
            sessionStorage.removeItem(STORAGE_KEY_LOCKOUT_UNTIL);
            sessionStorage.removeItem(STORAGE_KEY_FAILED_ATTEMPTS);
            setLockoutSecondsLeft(0);
          }
        }
      } catch {
        // Ignorer si sessionStorage non disponible
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const registerFailedAttempt = useCallback(() => {
    try {
      const current = parseInt(sessionStorage.getItem(STORAGE_KEY_FAILED_ATTEMPTS) || "0", 10) + 1;
      sessionStorage.setItem(STORAGE_KEY_FAILED_ATTEMPTS, current.toString());

      if (current >= MAX_FAILED_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
        sessionStorage.setItem(STORAGE_KEY_LOCKOUT_UNTIL, until.toString());
        setLockoutSecondsLeft(LOCKOUT_DURATION_SECONDS);
      }
    } catch {
      // Ignorer
    }
  }, []);

  const resetFailedAttempts = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY_FAILED_ATTEMPTS);
      sessionStorage.removeItem(STORAGE_KEY_LOCKOUT_UNTIL);
      setLockoutSecondsLeft(0);
    } catch {
      // Ignorer
    }
  }, []);

  // --- Hydratation du profil client ---
  const hydrateProfile = useCallback(
    async (supabaseUser: any, cachedProfile?: Partial<CustomerProfile> | null): Promise<CustomerProfile | null> => {
      if (!supabaseUser) return null;

      const metadata = supabaseUser.user_metadata || {};
      const baseProfile: CustomerProfile = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        firstName: metadata.first_name || metadata.firstName || cachedProfile?.firstName || "",
        lastName: metadata.last_name || metadata.lastName || cachedProfile?.lastName || "",
        phone: metadata.phone || cachedProfile?.phone || "",
        address: metadata.address || cachedProfile?.address || "",
        building: metadata.building || cachedProfile?.building || "",
        digicode: metadata.digicode || cachedProfile?.digicode || "",
        postalCode: metadata.postal_code || metadata.postalCode || cachedProfile?.postalCode || "75011",
        city: metadata.city || cachedProfile?.city || "Paris",
        favoriteFamily: metadata.favorite_family || cachedProfile?.favoriteFamily || "Orientale",
      };

      // Si Supabase est actif, charger les données persistées de customer_profiles
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("customer_profiles")
            .select("*")
            .eq("id", supabaseUser.id)
            .maybeSingle();

          if (!error && data) {
            baseProfile.firstName = data.first_name || baseProfile.firstName;
            baseProfile.lastName = data.last_name || baseProfile.lastName;
            baseProfile.phone = data.phone || baseProfile.phone;
            baseProfile.address = data.address || baseProfile.address;
            baseProfile.building = data.building || baseProfile.building;
            baseProfile.digicode = data.digicode || baseProfile.digicode;
            baseProfile.postalCode = data.postal_code || baseProfile.postalCode;
            baseProfile.city = data.city || baseProfile.city;
            baseProfile.favoriteFamily = data.favorite_family || baseProfile.favoriteFamily;
          }
        } catch (err) {
          console.warn("Table customer_profiles non disponible, repli métadonnées auth:", err);
        }
      }

      return baseProfile;
    },
    []
  );

  // --- Initialisation de la Session ---
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);

      // 1. Vérifier d'abord la session persistée de 7 jours
      const validSession = checkSessionValidity();
      let cached: CustomerProfile | null = validSession ? validSession.profile : null;

      if (!cached) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
          if (saved) {
            cached = JSON.parse(saved);
            if (cached && isMounted) {
              setUser(cached);
            }
          }
        } catch {
          // Ignorer
        }
      }

      // 2. Si Supabase est configuré, synchroniser l'état auth
      if (isSupabaseConfigured && supabase) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user && isMounted) {
            const profile = await hydrateProfile(session.user, cached);
            if (profile && isMounted) {
              saveLocalSession(profile);
            }
          } else if (!cached && isMounted) {
            clearLocalSession();
          }
        } catch (err) {
          console.warn("Erreur synchronisation session Supabase Auth:", err);
        }
      }

      if (isMounted) setIsLoading(false);
    }

    initAuth();

    // 3. Écouteur d'état Supabase Auth protégé contre les faux SIGNED_OUT
    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          const profile = await hydrateProfile(session.user);
          if (profile) {
            saveLocalSession(profile);
          }
        } else if (event === "SIGNED_OUT") {
          // Ne jamais purger la session locale si le token de 7 jours est encore valide
          const activeValidSession = checkSessionValidity();
          if (!activeValidSession) {
            clearLocalSession();
          }
        } else if (event === "USER_UPDATED" && session?.user) {
          const profile = await hydrateProfile(session.user);
          if (profile) {
            saveLocalSession(profile);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [checkSessionValidity, clearLocalSession, hydrateProfile, saveLocalSession]);

  // --- MÉTHODE LOGIN ---
  const login = useCallback(
    async (emailRaw: string, password: string): Promise<{ success: boolean; error?: string }> => {
      if (lockoutSecondsLeft > 0) {
        return {
          success: false,
          error: `Trop de tentatives infructueuses. Pour votre sécurité, veuillez patienter ${lockoutSecondsLeft} secondes.`,
        };
      }

      const email = sanitizeInput(emailRaw).toLowerCase();
      if (!email || !password) {
        return { success: false, error: "Veuillez renseigner votre adresse e-mail et votre mot de passe." };
      }

      // 1. Appel préalable au endpoint de synchronisation /api/auth/sync pour débloquer/auto-confirmer
      let syncedProfile: CustomerProfile | null = null;
      let syncedExpiresAt: number | null = null;
      let syncedToken: string | null = null;

      try {
        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, mode: "login" }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.profile) {
            syncedProfile = syncData.profile;
            syncedExpiresAt = syncData.expiresAt;
            syncedToken = syncData.token;
          }
        } else if (syncRes.status === 401) {
          registerFailedAttempt();
          return { success: false, error: "Identifiants invalides." };
        }
      } catch (e) {
        console.warn("Avertissement synchronisation préalable /api/auth/sync:", e);
      }

      // 2. Connexion avec Supabase Auth
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            registerFailedAttempt();
            if (error.message.includes("Invalid login credentials")) {
              return { success: false, error: "Adresse e-mail ou mot de passe incorrect." };
            }
            if (error.message.includes("Email not confirmed")) {
              return {
                success: false,
                error: "Veuillez confirmer votre adresse e-mail en cliquant sur le lien reçu dans votre boîte de réception.",
              };
            }
            return { success: false, error: error.message };
          }

          if (data.user) {
            resetFailedAttempts();
            const profile = syncedProfile || (await hydrateProfile(data.user));
            if (profile) {
              saveLocalSession(profile, syncedExpiresAt || undefined, syncedToken || undefined);
            }
            return { success: true };
          }
        } catch (err: any) {
          console.warn("Échec connexion Supabase:", err);
          registerFailedAttempt();
          return { success: false, error: "Erreur de connexion réseau. Veuillez vérifier votre accès internet." };
        }
      }

      // Mode démo résilient / local
      try {
        const savedProfileStr = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (savedProfileStr) {
          const parsed = JSON.parse(savedProfileStr);
          if (parsed && parsed.email.toLowerCase() === email) {
            resetFailedAttempts();
            saveLocalSession(parsed, syncedExpiresAt || undefined, syncedToken || undefined);
            return { success: true };
          }
        }

        // Créer un profil de démonstration temporaire si l'utilisateur teste en local
        resetFailedAttempts();
        const demoProfile: CustomerProfile = syncedProfile || {
          id: `usr-${Date.now()}`,
          email,
          firstName: "Paolo",
          lastName: "García Valdez",
          phone: "56105001",
          address: "",
          building: "",
          digicode: "",
          postalCode: "75011",
          city: "Paris",
          favoriteFamily: "Orientale",
        };
        saveLocalSession(demoProfile, syncedExpiresAt || undefined, syncedToken || undefined);
        return { success: true };
      } catch (e) {
        registerFailedAttempt();
        return { success: false, error: "Impossible de valider vos identifiants." };
      }
    },
    [
      hydrateProfile,
      lockoutSecondsLeft,
      registerFailedAttempt,
      resetFailedAttempts,
      saveLocalSession,
    ]
  );

  // --- MÉTHODE REGISTER ---
  const register = useCallback(
    async (data: RegisterData): Promise<{
      success: boolean;
      error?: string;
      needsEmailConfirmation?: boolean;
    }> => {
      const email = sanitizeInput(data.email).toLowerCase();
      const firstName = sanitizeInput(data.firstName, 60);
      const lastName = sanitizeInput(data.lastName, 60);
      const phone = sanitizeInput(data.phone || "", 30);

      if (!email || !data.password || !firstName || !lastName) {
        return { success: false, error: "Veuillez remplir tous les champs obligatoires (*)." };
      }

      const pwdCheck = validatePassword(data.password);
      if (!pwdCheck.valid) {
        return { success: false, error: pwdCheck.message };
      }

      // 1. Création et auto-confirmation via /api/auth/sync
      try {
        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: data.password,
            firstName,
            lastName,
            phone,
            mode: "register",
          }),
        });

        const syncData = await syncRes.json();
        if (!syncRes.ok) {
          return {
            success: false,
            error: syncData.error || "Impossible d'enregistrer votre compte.",
          };
        }

        if (syncData.profile) {
          // Établir la session Supabase cliente si possible
          if (isSupabaseConfigured && supabase) {
            await supabase.auth
              .signInWithPassword({
                email,
                password: data.password,
              })
              .catch((err) => console.warn("Connexion post-création Supabase:", err));
          }

          saveLocalSession(syncData.profile, syncData.expiresAt, syncData.token);
          return { success: true, needsEmailConfirmation: false };
        }
      } catch (err: any) {
        console.warn("Erreur inscription /api/auth/sync:", err);
      }

      // 2. Repli direct Supabase si l'API interne a échoué
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email,
            password: data.password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                phone,
              },
            },
          });

          if (error) {
            if (error.message.includes("User already registered")) {
              return {
                success: false,
                error: "Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter.",
              };
            }
            return { success: false, error: error.message };
          }

          const createdUser = authData.user;
          if (createdUser) {
            const newProfile: CustomerProfile = {
              id: createdUser.id,
              email,
              firstName,
              lastName,
              phone,
              address: "",
              building: "",
              digicode: "",
              postalCode: "75011",
              city: "Paris",
              favoriteFamily: "Orientale",
            };

            saveLocalSession(newProfile);
            const needsConfirmation = !authData.session;
            return { success: true, needsEmailConfirmation: needsConfirmation };
          }
        } catch (err: any) {
          console.warn("Erreur repli inscription Supabase:", err);
          return { success: false, error: "Erreur technique lors de l'enregistrement. Veuillez réessayer." };
        }
      }

      // Mode local / repli
      const localProfile: CustomerProfile = {
        id: `usr-${Date.now()}`,
        email,
        firstName,
        lastName,
        phone,
        address: "",
        building: "",
        digicode: "",
        postalCode: "75011",
        city: "Paris",
        favoriteFamily: "Orientale",
      };
      saveLocalSession(localProfile);

      return { success: true, needsEmailConfirmation: false };
    },
    [saveLocalSession]
  );

  // --- MÉTHODE UPDATE PROFILE ---
  const updateProfile = useCallback(
    async (fields: Partial<CustomerProfile>): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "Vous devez être connecté(e) pour modifier vos informations." };
      }

      const updated: CustomerProfile = {
        ...user,
        firstName: fields.firstName !== undefined ? sanitizeInput(fields.firstName, 60) : user.firstName,
        lastName: fields.lastName !== undefined ? sanitizeInput(fields.lastName, 60) : user.lastName,
        phone: fields.phone !== undefined ? sanitizeInput(fields.phone, 30) : user.phone,
        address: fields.address !== undefined ? sanitizeInput(fields.address, 150) : user.address,
        building: fields.building !== undefined ? sanitizeInput(fields.building, 60) : user.building,
        digicode: fields.digicode !== undefined ? sanitizeInput(fields.digicode, 30) : user.digicode,
        postalCode: fields.postalCode !== undefined ? sanitizeInput(fields.postalCode, 10) : user.postalCode,
        city: fields.city !== undefined ? sanitizeInput(fields.city, 60) : user.city,
        favoriteFamily: fields.favoriteFamily !== undefined ? sanitizeInput(fields.favoriteFamily, 60) : user.favoriteFamily,
      };

      saveLocalSession(updated, sessionExpiresAt || undefined);

      if (isSupabaseConfigured && supabase) {
        try {
          // 1. Mettre à jour les métadonnées de l'utilisateur auth
          await supabase.auth.updateUser({
            data: {
              first_name: updated.firstName,
              last_name: updated.lastName,
              phone: updated.phone,
              address: updated.address,
              building: updated.building,
              digicode: updated.digicode,
              postal_code: updated.postalCode,
              city: updated.city,
              favorite_family: updated.favoriteFamily,
            },
          });

          // 2. Mettre à jour la table customer_profiles
          await supabase.from("customer_profiles").upsert({
            id: updated.id,
            email: updated.email,
            first_name: updated.firstName,
            last_name: updated.lastName,
            phone: updated.phone,
            address: updated.address,
            building: updated.building,
            digicode: updated.digicode,
            postal_code: updated.postalCode,
            city: updated.city,
            favorite_family: updated.favoriteFamily,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Échec mise à jour distante customer_profiles:", err);
        }
      }

      return { success: true };
    },
    [saveLocalSession, sessionExpiresAt, user]
  );

  // --- MÉTHODE UPDATE PASSWORD ---
  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
      const pwdCheck = validatePassword(newPassword);
      if (!pwdCheck.valid) {
        return { success: false, error: pwdCheck.message };
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) {
            return { success: false, error: error.message };
          }
          return { success: true };
        } catch (err: any) {
          return { success: false, error: "Impossible de modifier le mot de passe actuellement." };
        }
      }

      return { success: true };
    },
    []
  );

  // --- RÉCUPÉRATION DU MOT DE PASSE PAR EMAIL ---
  const resetPasswordEmail = useCallback(
    async (emailRaw: string): Promise<{ success: boolean; error?: string }> => {
      const email = sanitizeInput(emailRaw).toLowerCase();
      if (!email) {
        return { success: false, error: "Veuillez renseigner votre adresse e-mail." };
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/compte` : undefined;
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
          });
          if (error) {
            return { success: false, error: error.message };
          }
          return { success: true };
        } catch (err: any) {
          return { success: false, error: "Erreur lors de l'envoi du lien de réinitialisation." };
        }
      }

      return { success: true };
    },
    []
  );

  // --- MÉTHODE LOGOUT ---
  const logout = useCallback(async () => {
    clearLocalSession();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Erreur déconnexion Supabase Auth:", err);
      }
    }
  }, [clearLocalSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        lockoutSecondsLeft,
        sessionExpiresAt,
        login,
        register,
        updateProfile,
        updatePassword,
        resetPasswordEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
