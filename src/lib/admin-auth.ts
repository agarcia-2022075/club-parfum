import crypto from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "club_parfum_admin_token";
export const ADMIN_TOKEN_PREFIX = "cp_adm.";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 heures
export const ADMIN_SESSION_DURATION_MS = ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

export interface AdminTokenPayload {
  role: "gerance_code" | "admin_user";
  userId?: string;
  email?: string;
  iat: number;
  exp: number;
}

function getSigningSecret(): string {
  return (process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

export function isAdminSigningConfigured(): boolean {
  return getSigningSecret().length > 0;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error("Secret de signature administrateur non configuré.");
  }

  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signatureB64 = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${ADMIN_TOKEN_PREFIX}${payloadB64}.${signatureB64}`;
}

export function verifyAdminToken(token?: string | null): AdminTokenPayload | null {
  const secret = getSigningSecret();
  if (!secret || !token || typeof token !== "string") {
    return null;
  }

  const trimmed = token.trim();
  if (!trimmed.startsWith(ADMIN_TOKEN_PREFIX)) {
    return null;
  }

  const rest = trimmed.slice(ADMIN_TOKEN_PREFIX.length);
  const parts = rest.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  const [payloadB64, providedSigB64] = parts;
  const expectedSigB64 = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");

  const expectedBuf = Buffer.from(expectedSigB64, "utf8");
  const providedBuf = Buffer.from(providedSigB64, "utf8");

  if (expectedBuf.length !== providedBuf.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate = parsed as Partial<AdminTokenPayload>;
    if (candidate.role !== "gerance_code" && candidate.role !== "admin_user") {
      return null;
    }
    if (typeof candidate.iat !== "number" || typeof candidate.exp !== "number") {
      return null;
    }
    if (Date.now() >= candidate.exp) {
      return null;
    }

    return {
      role: candidate.role,
      userId: typeof candidate.userId === "string" ? candidate.userId : undefined,
      email: typeof candidate.email === "string" ? candidate.email : undefined,
      iat: candidate.iat,
      exp: candidate.exp,
    };
  } catch {
    return null;
  }
}

export function verifyAdminRequest(request: NextRequest): AdminTokenPayload | null {
  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const fromCookie = verifyAdminToken(cookieToken);
  if (fromCookie) {
    return fromCookie;
  }

  const authHeader = request.headers.get("authorization") || "";
  if (/^Bearer\s+/i.test(authHeader)) {
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    const fromBearer = verifyAdminToken(bearerToken);
    if (fromBearer) {
      return fromBearer;
    }
  }

  const headerToken = request.headers.get("x-admin-token");
  if (headerToken) {
    const fromHeader = verifyAdminToken(headerToken);
    if (fromHeader) {
      return fromHeader;
    }
  }

  return null;
}

export function isAllowedAdminEmail(email: string): boolean {
  const rawAllowed = process.env.ADMIN_EMAIL || "";
  const allowedList = rawAllowed
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (allowedList.length === 0) {
    return false;
  }

  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
  return Boolean(normalized) && allowedList.includes(normalized);
}

export function safeEqualSecret(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string" || !a || !b) {
    return false;
  }

  const hashA = crypto.createHash("sha256").update(a, "utf8").digest();
  const hashB = crypto.createHash("sha256").update(b, "utf8").digest();

  return hashA.length === hashB.length && crypto.timingSafeEqual(hashA, hashB);
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}
