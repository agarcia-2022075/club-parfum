import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      passcode,
    }: {
      email?: string;
      password?: string;
      passcode?: string;
    } = body;

    const serverAdminCode = process.env.ADMIN_ACCESS_CODE || "GRASSE2026_SECURE";

    // --- OPTION B : Code de Secours de Gérance validé côté serveur ---
    if (passcode && typeof passcode === "string") {
      const cleanPasscode = passcode.trim();
      if (cleanPasscode === serverAdminCode) {
        const tokenIssuedAt = Date.now();
        const expiresAt = tokenIssuedAt + 24 * 60 * 60 * 1000; // Session de 24h
        const adminToken = `cp_adm_${Buffer.from(
          JSON.stringify({
            role: "gerance_code",
            iat: tokenIssuedAt,
            exp: expiresAt,
          })
        ).toString("base64url")}`;

        const response = NextResponse.json({
          success: true,
          method: "passcode",
          adminToken,
          expiresAt,
        });

        response.cookies.set("club_parfum_admin_token", adminToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60,
          path: "/",
        });

        return response;
      }

      return NextResponse.json(
        { error: "Code d'accès de gérance invalide." },
        { status: 401 }
      );
    }

    // --- OPTION A : Identifiants Supabase Auth de l'Administratrice ---
    if (email && password) {
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: "Service d'authentification Supabase indisponible." },
          { status: 500 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError || !authData.user) {
        return NextResponse.json(
          { error: "Identifiants administratrice invalides." },
          { status: 401 }
        );
      }

      const tokenIssuedAt = Date.now();
      const expiresAt = tokenIssuedAt + 24 * 60 * 60 * 1000; // Session de 24h
      const adminToken = `cp_adm_${Buffer.from(
        JSON.stringify({
          role: "admin_user",
          userId: authData.user.id,
          email: normalizedEmail,
          iat: tokenIssuedAt,
          exp: expiresAt,
        })
      ).toString("base64url")}`;

      const response = NextResponse.json({
        success: true,
        method: "credentials",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        adminToken,
        expiresAt,
      });

      response.cookies.set("club_parfum_admin_token", adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Veuillez fournir vos identifiants ou votre code de gérance." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur dans /api/admin/verify:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'authentification." },
      { status: 500 }
    );
  }
}
