import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  supabaseAnonKey.length > 10
);

// Initialisation sécurisée du client public pour les opérations côté client (catalogue, création de commande)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Cache d'instance pour le client d'administration côté serveur
let adminClientInstance: SupabaseClient | null = null;

/**
 * Client d'authentification éphémère exclusif côté serveur.
 * Crée une nouvelle instance sans persistance ni singleton afin que signInWithPassword
 * ne mute jamais l'état d'authentification en mémoire du client service_role.
 */
export function createServerAuthClient() {
  if (typeof window !== "undefined") {
    return null;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Client Supabase d'administration exclusif pour les Server Components, Server Actions ou Route Handlers.
 * Utilise la SUPABASE_SERVICE_ROLE_KEY pour contourner les politiques RLS en toute sécurité.
 * Retourne strictement null côté navigateur ou si la clé service_role est absente (fail-closed).
 */
export function getSupabaseAdmin() {
  // Sécurité stricte : Ne jamais instancier ou exposer le service role dans le navigateur
  if (typeof window !== "undefined") {
    return null;
  }

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "";

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!adminClientInstance) {
    adminClientInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClientInstance;
}
