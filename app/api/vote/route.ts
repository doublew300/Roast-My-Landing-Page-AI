import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        console.log(`[Vote API] Attempting to vote for ID: ${id}`);

        // Initialize Supabase client locally
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // 1. Try RPC first (atomic)
        const { data: rpcData, error: rpcError } = await supabase.rpc('increment_vote', { roast_id: id });

        if (rpcError) {
            console.warn(`[Vote API] RPC 'increment_vote' failed: ${rpcError.message}. Trying direct update...`);

            // 2. Fallback: Fetch + Update (Manual increment)
            const { data: roast, error: fetchError } = await supabase
                .from('roasts')
                .select('votes')
                .eq('id', id)
                .single();

            if (fetchError) {
                console.error(`[Vote API] Failed to fetch roast: ${fetchError.message}`);
                return NextResponse.json({ error: fetchError.message }, { status: 500 });
            }

            const newVotes = (roast?.votes || 0) + 1;
            console.log(`[Vote API] Current votes: ${roast?.votes}, New votes: ${newVotes}`);

            const { error: updateError } = await supabase
                .from('roasts')
                .update({ votes: newVotes })
                .eq('id', id);

            if (updateError) {
                console.error(`[Vote API] Direct update failed (likely RLS): ${updateError.message}`);
                return NextResponse.json({ error: "Failed to update vote. RLS might be blocking." }, { status: 500 });
            }

            console.log(`[Vote API] Direct update successful.`);
        } else {
            console.log(`[Vote API] RPC successful.`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[Vote API] Unexpected error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
