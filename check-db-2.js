import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase.from('roasts').select('*').limit(1);
    if (data && data.length) {
        console.log("HAS_VOTES_COL:", data[0].hasOwnProperty('votes'));
        console.log("VOTES_VAL:", data[0].votes);
    } else {
        console.log("NO_DATA");
    }

    const { error } = await supabase.rpc('increment_vote', { roast_id: '00000000-0000-0000-0000-000000000000' });
    console.log("RPC_ERR:", error ? error.message : "NONE");
}
run();
