import { NextRequest, NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_DURATION_MS,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  getClientIp,
  isAdminSigningConfigured,
  isAllowedAdminEmail,
  safeEqualSecret,
  signAdminToken,
  verifyAdminRequest,
} from "@/lib/admin-auth";

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const failedAttemptsByIp = new Map<string, RateLimitEntry>();

function pruneExpiredEntries(now: number) {
  if (failedAttemptsByIp.size <= 500) return;
  for (const [key, entry] of failedAttemptsByIp.entries()) {
    if (now >= entry.resetAt) {
      failedAttemptsByIp.delete(key);
    }
  }
}

function getRateLimitStatus(ip: string, now: number): { blocked: boolean; retryAfterSeconds: number } {
  const entry = failedAttemptsByIp.get(ip);
  if (!entry) {
    return { blocked: false, retryAfterSeconds: 0 };
  }
  if (now >= entry.resetAt) {
    failedAttemptsByIp.delete(ip);
    return { blocked: false, retryAfterSeconds: 0 };
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    return {
      blocked: true,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { blocked: false, retryAfterSeconds: 0 };
}

function recordFailedAttempt(ip: string, now: number) {
  pruneExpiredEntries(now);
  const existing = failedAttemptsByIp.get(ip);
  if (!existing || now >= existing.resetAt) {
    failedAttemptsByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  existing.count += 1;
}

function clearFailedAttempts(ip: string) {
  failedAttemptsByIp.delete(ip);
}

function attachAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function GET(request: NextRequest) {
  const session = verifyAdminRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      role: session.role,
      email: session.email,
    },
    { status: 200 }
  );
}

export async function DELETE() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const now = Date.now();
    const clientIp = getClientIp(request);
    const rateStatus = getRateLimitStatus(clientIp, now);

    if (rateStatus.blocked) {
      return NextResponse.json(
        { error: "Trop de tentatives échouées. Veuillez réessayer dans quelques minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateStatus.retryAfterSeconds) },
        }
      );
    }

    let body: { email?: unknown; password?: unknown; passcode?: unknown };
    try {
      body = (await request.json()) as { email?: unknown; password?: unknown; passcode?: unknown };
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
    }

    const { email, password, passcode } = body;

    // --- OPTION A : Code de Gérance validé côté serveur ---
    if (typeof passcode === "string" && passcode.trim().length > 0) {
      const serverAdminCode = process.env.ADMIN_ACCESS_CODE?.trim() || "";
      if (!serverAdminCode) {
        return NextResponse.json(
          { error: "L'accès par code de gérance n'est pas configuré sur le serveur." },
          { status: 503 }
        );
      }

      const cleanPasscode = passcode.trim();
      if (!safeEqualSecret(cleanPasscode, serverAdminCode)) {
        recordFailedAttempt(clientIp, now);
        return NextResponse.json(
          { error: "Code d'accès de gérance invalide." },
          { status: 401 }
        );
      }

      if (!isAdminSigningConfigured()) {
        return NextResponse.json(
          { error: "Configuration de signature administrateur manquante sur le serveur." },
          { status: 503 }
        );
      }

      clearFailedAttempts(clientIp);
      const tokenIssuedAt = Date.now();
      const expiresAt = tokenIssuedAt + ADMIN_SESSION_DURATION_MS;
      const adminToken = signAdminToken({
        role: "gerance_code",
        iat: tokenIssuedAt,
        exp: expiresAt,
      });

      const response = NextResponse.json({
        success: true,
        method: "passcode",
        role: "gerance_code",
        expiresAt,
      });

      attachAdminCookie(response, adminToken);
      return response;
    }

    // --- OPTION B : Identifiants Supabase Auth de l'Administrateur ---
    if (
      typeof email === "string" &&
      email.trim().length > 0 &&
      typeof password === "string" &&
      password.length > 0
    ) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!isAllowedAdminEmail(normalizedEmail)) {
        recordFailedAttempt(clientIp, now);
        return NextResponse.json(
          { error: "Accès refusé : ce compte n'est pas autorisé à administrer la boutique." },
          { status: 403 }
        );
      }

      const authClient = createServerAuthClient();
      if (!authClient) {
        return NextResponse.json(
          { error: "Service d'authentification Supabase indisponible." },
          { status: 503 }
        );
      }

      const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError || !authData.user) {
        recordFailedAttempt(clientIp, now);
        return NextResponse.json(
          { error: "Identifiants administratrice invalides." },
          { status: 401 }
        );
      }

      if (!isAdminSigningConfigured()) {
        return NextResponse.json(
          { error: "Configuration de signature administrateur manquante sur le serveur." },
          { status: 503 }
        );
      }

      clearFailedAttempts(clientIp);
      const tokenIssuedAt = Date.now();
      const expiresAt = tokenIssuedAt + ADMIN_SESSION_DURATION_MS;
      const adminToken = signAdminToken({
        role: "admin_user",
        userId: authData.user.id,
        email: normalizedEmail,
        iat: tokenIssuedAt,
        exp: expiresAt,
      });

      const response = NextResponse.json({
        success: true,
        method: "credentials",
        role: "admin_user",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        expiresAt,
      });

      attachAdminCookie(response, adminToken);
      return response;
    }

    return NextResponse.json(
      { error: "Veuillez fournir vos identifiants ou votre code de gérance." },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Erreur dans /api/admin/verify:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'authentification." },
      { status: 500 }
    );
  }
}
