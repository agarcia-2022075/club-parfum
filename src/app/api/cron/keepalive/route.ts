import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { safeEqualSecret } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET?.trim();

    if (cronSecret && !safeEqualSecret(authHeader || "", `Bearer ${cronSecret}`)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized" },
        { status: 500 }
      );
    }

    // Query minimale ultralégère pour enregistrer l'activité dans la base de données
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
