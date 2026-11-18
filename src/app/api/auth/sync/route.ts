import { NextRequest, NextResponse } from "next/server";
import { createServerAuthClient, getSupabaseAdmin } from "@/lib/supabase";
import { CustomerProfile } from "@/types/store";

interface DbCustomerProfileRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  building: string | null;
  digicode: string | null;
  postal_code: string | null;
  city: string | null;
  favorite_family: string | null;
}

interface SyncRequestBody {
  email?: unknown;
  password?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  mode?: unknown;
}

function validatePasswordStrength(password: string): boolean {
  if (!password || password.length < 8) {
    return false;
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  return hasLetter && hasDigitOrSpecial;
}

function sanitizeText(value: unknown, maxLength = 120): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

function isExistingUserError(error: { message?: string; code?: string; status?: number }): boolean {
  const msg = (error.message || "").toLowerCase();
  const code = (error.code || "").toLowerCase();
  return (
    msg.includes("already been registered") ||
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    code === "email_exists" ||
    code === "user_already_exists" ||
    error.status === 422
  );
}

function buildCustomerProfile(
  userId: string,
  email: string,
  dbProfile: DbCustomerProfileRow | null,
  fallbackFirstName: string,
  fallbackLastName: string,
  fallbackPhone: string
): CustomerProfile {
  return {
    id: userId,
    email,
    firstName: dbProfile?.first_name ?? fallbackFirstName,
    lastName: dbProfile?.last_name ?? fallbackLastName,
    phone: dbProfile?.phone ?? fallbackPhone,
    address: dbProfile?.address ?? "",
    building: dbProfile?.building ?? "",
    digicode: dbProfile?.digicode ?? "",
    postalCode: dbProfile?.postal_code ?? "",
    city: dbProfile?.city ?? "",
    favoriteFamily: dbProfile?.favorite_family ?? "Orientale",
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase d'administration manquante sur le serveur." },
        { status: 500 }
      );
    }

    let body: SyncRequestBody;
    try {
      body = (await request.json()) as SyncRequestBody;
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
    }

    const { email, password, firstName, lastName, phone, mode } = body;

    // 1. N'accepter STRICTEMENT que "login" ou "register"
    if (mode !== "login" && mode !== "register") {
      return NextResponse.json(
        { error: "Mode d'authentification non pris en charge." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Une adresse e-mail valide est requise." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // --- MODE LOGIN : Vérification stricte via client Auth éphémère ---
    if (mode === "login") {
      if (typeof password !== "string" || password.length === 0) {
        return NextResponse.json(
          { error: "Le mot de passe est obligatoire pour vous connecter." },
          { status: 400 }
        );
      }

      const authClient = createServerAuthClient();
      if (!authClient) {
        return NextResponse.json(
          { error: "Service d'authentification Supabase indisponible." },
          { status: 500 }
        );
      }

      const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError || !authData.user) {
        return NextResponse.json(
          { error: "Identifiants invalides." },
          { status: 401 }
        );
      }

      const authUser = authData.user;
      const userMeta = (authUser.user_metadata || {}) as Record<string, unknown>;
      const metaFirstName = sanitizeText(userMeta.first_name ?? userMeta.firstName, 60);
      const metaLastName = sanitizeText(userMeta.last_name ?? userMeta.lastName, 60);
      const metaPhone = sanitizeText(userMeta.phone, 30);

      let dbProfile: DbCustomerProfileRow | null = null;
      try {
        const { data: existingProfile } = await supabaseAdmin
          .from("customer_profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle<DbCustomerProfileRow>();

        if (existingProfile) {
          dbProfile = existingProfile;
        } else {
          const initialPayload = {
            id: authUser.id,
            email: normalizedEmail,
            first_name: metaFirstName,
            last_name: metaLastName,
            phone: metaPhone,
            address: "",
            building: "",
            digicode: "",
            postal_code: "",
            city: "",
            favorite_family: "Orientale",
            updated_at: new Date().toISOString(),
          };

          const { data: inserted, error: insertError } = await supabaseAdmin
            .from("customer_profiles")
            .upsert(initialPayload)
            .select()
            .single<DbCustomerProfileRow>();

          if (insertError) {
            console.warn("Avertissement synchronisation customer_profiles:", insertError);
          } else {
            dbProfile = inserted;
          }
        }
      } catch (err) {
        console.warn("Exception lecture/synchronisation customer_profiles:", err);
      }

      const customerProfile = buildCustomerProfile(
        authUser.id,
        normalizedEmail,
        dbProfile,
        metaFirstName,
        metaLastName,
        metaPhone
      );

      return NextResponse.json(
        {
          success: true,
          user: {
            id: authUser.id,
            email: authUser.email,
            email_confirmed_at: authUser.email_confirmed_at,
          },
          profile: customerProfile,
        },
        { status: 200 }
      );
    }

    // --- MODE REGISTER : Création stricte avec refus 409 si email déjà utilisé ---
    const cleanFirstName = sanitizeText(firstName, 60);
    const cleanLastName = sanitizeText(lastName, 60);
    const cleanPhone = sanitizeText(phone, 30);

    if (!cleanFirstName || !cleanLastName) {
      return NextResponse.json(
        { error: "Le prénom et le nom sont obligatoires." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || !validatePasswordStrength(password)) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre et un chiffre ou caractère spécial.",
        },
        { status: 400 }
      );
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: cleanFirstName,
        last_name: cleanLastName,
        phone: cleanPhone,
      },
    });

    if (createError) {
      if (isExistingUserError(createError)) {
        return NextResponse.json(
          { error: "Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter." },
          { status: 409 }
        );
      }

      console.error("Erreur création utilisateur Supabase Admin:", createError);
      return NextResponse.json(
        { error: createError.message || "Impossible de créer le compte." },
        { status: 400 }
      );
    }

    if (!created?.user) {
      return NextResponse.json(
        { error: "Impossible de finaliser la création du compte." },
        { status: 500 }
      );
    }

    const createdUser = created.user;
    let dbProfile: DbCustomerProfileRow | null = null;

    try {
      const profilePayload = {
        id: createdUser.id,
        email: normalizedEmail,
        first_name: cleanFirstName,
        last_name: cleanLastName,
        phone: cleanPhone,
        address: "",
        building: "",
        digicode: "",
        postal_code: "",
        city: "",
        favorite_family: "Orientale",
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("customer_profiles")
        .upsert(profilePayload)
        .select()
        .single<DbCustomerProfileRow>();

      if (insertError) {
        console.warn("Avertissement insertion profil client:", insertError);
      } else {
        dbProfile = inserted;
      }
    } catch (err) {
      console.warn("Exception insertion customer_profiles:", err);
    }

    const customerProfile = buildCustomerProfile(
      createdUser.id,
      normalizedEmail,
      dbProfile,
      cleanFirstName,
      cleanLastName,
      cleanPhone
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          email_confirmed_at: createdUser.email_confirmed_at,
        },
        profile: customerProfile,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur inattendue dans /api/auth/sync:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de la synchronisation de l'authentification." },
      { status: 500 }
    );
  }
}
