import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CustomerProfile } from "@/types/store";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase d'administration manquante sur le serveur." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      mode = "login",
    }: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      mode?: "login" | "register" | "refresh";
    } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Une adresse e-mail valide est requise." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Rechercher si l'utilisateur existe déjà dans Supabase Auth
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error("Erreur listUsers Supabase Auth Admin:", listError);
      return NextResponse.json(
        { error: "Impossible de vérifier le compte utilisateur." },
        { status: 500 }
      );
    }

    let existingUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    // 2. Auto-confirmation automatique si l'utilisateur existe déjà mais n'a pas confirmé son email
    if (existingUser) {
      if (!existingUser.email_confirmed_at) {
        const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            email_confirm: true,
          }
        );
        if (updateError) {
          console.warn("Échec auto-confirmation utilisateur existant:", updateError);
        } else if (updated?.user) {
          existingUser = updated.user;
        }
      }
    }

    // 3. Si mode === "register" et que l'utilisateur n'existe pas encore, le créer directement auto-confirmé
    if (mode === "register" && !existingUser) {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: password || undefined,
        email_confirm: true,
        user_metadata: {
          first_name: firstName || "",
          last_name: lastName || "",
          phone: phone || "",
        },
      });

      if (createError) {
        console.error("Erreur création utilisateur Supabase Admin:", createError);
        return NextResponse.json(
          { error: createError.message || "Impossible de créer le compte." },
          { status: 400 }
        );
      }

      existingUser = created.user;
    }

    if (!existingUser) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé pour cette adresse." },
        { status: 404 }
      );
    }

    // 4. Synchroniser et assurer l'existence de la ligne dans public.customer_profiles
    const userMeta = existingUser.user_metadata || {};
    const finalFirstName =
      firstName || userMeta.first_name || userMeta.firstName || "Membre";
    const finalLastName =
      lastName || userMeta.last_name || userMeta.lastName || "Club Parfum";
    const finalPhone = phone || userMeta.phone || "";

    let dbProfile: any = null;
    try {
      const { data: existingProfile } = await supabaseAdmin
        .from("customer_profiles")
        .select("*")
        .eq("id", existingUser.id)
        .maybeSingle();

      const profilePayload = {
        id: existingUser.id,
        email: normalizedEmail,
        first_name: existingProfile?.first_name || finalFirstName,
        last_name: existingProfile?.last_name || finalLastName,
        phone: existingProfile?.phone || finalPhone,
        address: existingProfile?.address || "",
        building: existingProfile?.building || "",
        digicode: existingProfile?.digicode || "",
        postal_code: existingProfile?.postal_code || "75011",
        city: existingProfile?.city || "Paris",
        favorite_family: existingProfile?.favorite_family || "Orientale",
        updated_at: new Date().toISOString(),
      };

      const { data: upserted, error: upsertError } = await supabaseAdmin
        .from("customer_profiles")
        .upsert(profilePayload)
        .select()
        .single();

      if (upsertError) {
        console.warn("Avertissement upsert customer_profiles:", upsertError);
      } else {
        dbProfile = upserted;
      }
    } catch (err) {
      console.warn("Exception synchronisation customer_profiles:", err);
    }

    // 5. Construire le profil typé complet
    const customerProfile: CustomerProfile = {
      id: existingUser.id,
      email: normalizedEmail,
      firstName: dbProfile?.first_name || finalFirstName,
      lastName: dbProfile?.last_name || finalLastName,
      phone: dbProfile?.phone || finalPhone,
      address: dbProfile?.address || "",
      building: dbProfile?.building || "",
      digicode: dbProfile?.digicode || "",
      postalCode: dbProfile?.postal_code || "75011",
      city: dbProfile?.city || "Paris",
      favoriteFamily: dbProfile?.favorite_family || "Orientale",
    };

    // 6. Génération de la session de 7 jours
    const tokenIssuedAt = Date.now();
    const expiresAt = tokenIssuedAt + SESSION_DURATION_MS;
    const sessionToken = `cp_sess_${Buffer.from(
      JSON.stringify({
        uid: existingUser.id,
        email: normalizedEmail,
        iat: tokenIssuedAt,
        exp: expiresAt,
      })
    ).toString("base64url")}`;

    return NextResponse.json({
      success: true,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        email_confirmed_at: existingUser.email_confirmed_at,
      },
      profile: customerProfile,
      token: sessionToken,
      tokenIssuedAt,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Erreur inattendue dans /api/auth/sync:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de la synchronisation de l'authentification." },
      { status: 500 }
    );
  }
}
