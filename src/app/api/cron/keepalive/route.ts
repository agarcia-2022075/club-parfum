import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    // Si CRON_SECRET est défini sur Vercel, valider l'appel
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Vercel Cron envoie cette signature automatiquement
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized" },
        { status: 500 }
      );
    }

    // Query minimale ultraliviana para registrar actividad en la base de datos
    const { count, error } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { status: "error", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "alive",
      message: "Supabase Keepalive successful",
      timestamp: new Date().toISOString(),
      recordsPinged: count,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
