import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "newest"; // 'newest' or 'worst'
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
        .from('roasts')
        .select('*');

    if (sort === 'worst') {
        query = query.order('score', { ascending: true });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
        console.error("[API] Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[API] Found ${data?.length} roasts.`);
    return NextResponse.json(data);
}
