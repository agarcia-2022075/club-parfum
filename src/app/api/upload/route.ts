import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase manquante ou invalide sur le serveur." },
        { status: 500 }
      );
    }

    // 0. Vérification stricte de l'autorisation d'administration (Session ou Token requis)
    const authHeader = request.headers.get("authorization") || "";
    const adminTokenHeader = request.headers.get("x-admin-token") || "";
    const adminCookie = request.cookies.get("club_parfum_admin_token")?.value || "";

    const candidateToken =
      authHeader.replace(/^Bearer\s+/i, "").trim() ||
      adminTokenHeader.trim() ||
      adminCookie.trim();

    let isAuthorized = false;

    if (candidateToken && candidateToken.startsWith("cp_adm_")) {
      try {
        const payloadStr = Buffer.from(
          candidateToken.replace("cp_adm_", ""),
          "base64url"
        ).toString("utf8");
        const payload = JSON.parse(payloadStr);
        if (payload && payload.exp && Date.now() < payload.exp) {
          isAuthorized = true;
        }
      } catch {
        // Token invalide
      }
    }

    const passcodeHeader = request.headers.get("x-admin-passcode");
    const serverAdminCode = process.env.ADMIN_ACCESS_CODE || "GRASSE2026_SECURE";
    if (passcodeHeader && passcodeHeader === serverAdminCode) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Accès refusé. Session administrateur autorisée requise pour téléverser." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier image valide n'a été fourni dans la requête." },
        { status: 400 }
      );
    }

    // 1. Validation du type MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format d'image non autorisé. Utilisez JPG, PNG, WebP ou AVIF." },
        { status: 400 }
      );
    }

    // 2. Validation de la taille maximale (5 Mo)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "L'image dépasse la taille maximale autorisée de 5 Mo." },
        { status: 400 }
      );
    }

    // 3. Auto-création / vérification du bucket 'products'
    try {
      const { data: bucket, error: bucketError } = await supabaseAdmin.storage.getBucket("products");
      if (bucketError || !bucket) {
        await supabaseAdmin.storage.createBucket("products", {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });
      }
    } catch (err) {
      console.warn("Vérification automatique du bucket products:", err);
    }

    // 4. Génération du nom de fichier selon les spécifications
    const originalExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpeg", "jpg", "png", "webp", "avif"].includes(originalExt) ? originalExt : "jpg";
    const storagePath = `catalog/flacon-${Date.now()}.${safeExt}`;

    // 5. Conversion en Buffer et téléversement vers Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("products")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Erreur téléversement Supabase Storage:", uploadError);
      return NextResponse.json(
        { error: `Échec du téléversement sur Supabase Storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 6. Récupération de l'URL publique CDN
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("products")
      .getPublicUrl(storagePath);

    return NextResponse.json(
      {
        url: publicUrlData.publicUrl,
        storage: "supabase",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erreur inattendue dans /api/upload:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement de l'image." },
      { status: 500 }
    );
  }
}
