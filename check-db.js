import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log("Checking 'roasts' table schema...");
    const { data, error } = await supabase
        .from('roasts')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching roast:", error);
    } else if (data && data.length > 0) {
        console.log("Roast keys:", Object.keys(data[0]));
        if (data[0].hasOwnProperty('votes')) {
            console.log("✅ 'votes' column exists.");
        } else {
            console.log("❌ 'votes' column MISSING.");
        }
    } else {
        console.log("No roasts found to check schema.");
    }

    console.log("\nTesting 'increment_vote' RPC...");
    // Try to call it with a dummy ID (or a real one if we have it)
    // We'll just see if it errors with "function not found"
    const { error: rpcError } = await supabase.rpc('increment_vote', { roast_id: '00000000-0000-0000-0000-000000000000' });

    if (rpcError) {
        console.error("RPC Error:", rpcError.message);
    } else {
        console.log("✅ 'increment_vote' RPC seems to exist (or at least didn't fail with 'not found').");
    }
}

checkSchema();
